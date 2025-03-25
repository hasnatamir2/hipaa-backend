import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity/file.entity';
import { Folder } from '../folders/entities/folder.entity/folder.entity';
import { UploadFileDto } from './dto/upload-file.dto/upload-file.dto';
import { ConfigService } from '@nestjs/config';
import { EncryptionUtil } from 'src/common/utils/encryption.util';
import { User } from 'src/users/entities/user.entity/user.entity';
import { Permission } from 'src/permissions/entities/permission.entity/permission.entity';
import { UserRole } from 'src/common/constants/roles/roles.enum';
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';
import { ActivityLogType } from 'src/common/constants/activity-logs/activity-logs';
import { Readable } from 'stream';
import { parse } from 'file-type-mime';
import { PermissionsService } from 'src/permissions/permissions.service';
import { FileVersion } from './entities/file.entity/file-version.entity';

@Injectable()
export class FilesService {
  private supabase: SupabaseClient;
  private readonly bucketName: string;

  constructor(
    @InjectRepository(File) private fileRepository: Repository<File>,
    @InjectRepository(Folder) private folderRepository: Repository<Folder>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
    @InjectRepository(FileVersion)
    private versionRepository: Repository<FileVersion>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly activityLogService: ActivityLogsService,
    private readonly permissionsService: PermissionsService,

    private configService: ConfigService,
  ) {
    const supabaseUrl =
      this.configService.get<string>('SUPABASE_UPLOAD_URL') || '';
    const supabaseKey =
      this.configService.get<string>('SUPABASE_ANON_KEY') || '';
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.bucketName =
      this.configService.get<string>('SUPABASE_BUCKET_NAME') || 'files';
  }

  // private blobToBase64(arrayBuffer: any): string {
  //   return Buffer.from(arrayBuffer).toString('base64');
  // }

  async uploadFile(
    uploadFileDto: UploadFileDto,
    file: Express.Multer.File,
    user: User,
  ): Promise<File> {
    const fileBuffer = file.buffer;
    const encryptFile = EncryptionUtil.encryptFile(fileBuffer);
    const fileType = parse(fileBuffer); // get file type

    const uniqueFilename = `${Date.now()}-${file.originalname}`;
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(uniqueFilename, encryptFile, {
        contentType: fileType?.mime,
      });

    if (error) {
      throw new Error('File upload failed: ' + error.message);
    }

    let newFile: File;

    if (!uploadFileDto.fileId) {
      newFile = new File();
      newFile.name = file.originalname;
      newFile.url = data.fullPath;
      newFile.size = fileBuffer.byteLength;
      newFile.owner = user;
      newFile.lastModified = new Date();
      newFile.mimeType = fileType?.mime || 'application/octet-stream';
      newFile.versions = [];
      await this.fileRepository.save(newFile);
    } else {
      const oldFile = await this.fileRepository.findOne({
        where: { id: uploadFileDto.fileId },
        relations: ['versions'],
      });

      if (!oldFile) {
        throw new NotFoundException('File not found');
      }
      newFile = oldFile;
      newFile.mimeType = fileType?.mime || 'application/octet-stream';
      newFile.size = fileBuffer.byteLength;
    }

    const version = new FileVersion();
    version.filePath = data.fullPath; // Path of the new file
    version.fileSize = fileBuffer.byteLength; // Size of the file
    version.versionNumber = `v${newFile.versions.length + 1}`; // Increment version number
    version.file = newFile; // Associate with the file entity
    version.createdAt = new Date();
    const freshVersion = await this.versionRepository.save(version);

    newFile.currentVersionId = freshVersion.id;

    const newVersion = [...newFile.versions, freshVersion];
    newFile.versions = JSON.parse(JSON.stringify(newVersion));

    if (uploadFileDto.folderId) {
      const folder = await this.folderRepository.findOne({
        where: { id: uploadFileDto.folderId },
      });
      if (!folder) {
        throw new NotFoundException('Folder not found');
      }
      newFile.folder = folder;
    }

    await this.activityLogService.logAction(
      user.id,
      ActivityLogType.UPLOAD,
      newFile.id,
      'FILE',
    );

    const savedFile = await this.fileRepository.save(newFile);

    await this.permissionsService.setDefaultFilePermissions(newFile, user);
    return savedFile;
  }

  async bulkUploadFile(
    uploadFileDto: UploadFileDto,
    files: Array<Express.Multer.File>,
    user: User,
  ): Promise<File[]> {
    const uploadedFiles: File[] = [];
    for (const file of files) {
      const uploadedFile = await this.uploadFile(uploadFileDto, file, user);
      uploadedFiles.push(uploadedFile);
    }
    return uploadedFiles;
  }

  async downloadFile(fileKey: string) {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .download(fileKey);
    const file = await this.fileRepository.findOne({
      where: { url: `${this.bucketName}/${fileKey}` },
    });

    if (error || !data || !file) {
      throw new NotFoundException('File not found');
    }
    const encryptedBuffer = await data.arrayBuffer(); // Convert the fetched file to ArrayBuffer
    const fileBuffer = EncryptionUtil.decryptFile(Buffer.from(encryptedBuffer)); // Decrypt the file buffer

    return {
      filebuffer: fileBuffer,
      file,
    };
  }

  async getFiles(folderId: string, user: User, sort: string): Promise<File[]> {
    // Validate folderId if provided
    if (folderId) {
      const folder = await this.folderRepository.findOne({
        where: { id: folderId },
      });
      if (!folder) {
        throw new NotFoundException('Folder not found');
      }
      // Check if user has permission to view files in this folder
      return await this.fileRepository.find({
        where: { folder: folder },
        relations: ['permissions'],
      });
    } else {
      // Return all files user has access to
      return await this.fileRepository.find({
        where: { owner: { id: user.id } },
        order: { lastModified: sort === 'asc' ? 'ASC' : 'DESC' },
        relations: ['permissions'],
      });
    }
  }

  async getFileDetails(fileId: string, user: User): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
      relations: ['owner', 'versions'],
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Check if the user has permission to access the file
    const hasAccess = await this.permissionsService.canViewFile(
      user.id,
      file.id,
    );
    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }
    await this.activityLogService.logAction(
      user.id,
      ActivityLogType.DOWNLOAD,
      fileId,
      'FILE',
    );
    return file;
  }

  async deleteFile(fileId: string, user: User): Promise<void> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
      relations: ['owner'],
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    const hasAccess = await this.hasAccessToFile(file, user);
    // Check if the user has permission to delete the file
    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }
    await this.permissionsService.deletePermissionsByFileId(fileId);

    await this.activityLogService.logAction(
      user.id,
      ActivityLogType.DELETE,
      fileId,
      'FILE',
    );

    await this.fileRepository.delete({ id: fileId });
  }

  async revertToVersion(fileId: string, versionId: string) {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
      relations: ['versions'],
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    const version = file.versions.find(
      (v: FileVersion) => v.versionNumber === versionId,
    );

    if (!version) {
      throw new NotFoundException('Version not found');
    }

    file.currentVersionId = versionId;
    return await this.fileRepository.save(file);
  }

  async getFileVersions(fileId: string) {
    const fileEntity = await this.fileRepository.findOne({
      where: { id: fileId },
      relations: ['versions'],
    });

    if (!fileEntity || fileEntity.versions.length === 0) {
      throw new NotFoundException('No previous versions available.');
    }

    return fileEntity.versions;
  }

  async getSharedFiles(userId: string): Promise<File[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['groups'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get files shared with the user directly
    const directlySharedFiles = await this.fileRepository
      .createQueryBuilder('file')
      .innerJoin('file.permissions', 'permission')
      // .leftJoinAndSelect('file.owner', 'user')
      .where('permission.userId = :userId', { userId })
      .andWhere('permission.accessLevel IN (:...accessLevels)', {
        accessLevels: ['read', 'write'],
      })
      // .select([
      //   'file.id',
      //   'file.name',
      //   'file.url',
      //   'file.size',
      //   'file.mimeType',
      //   'file.lastModified',
      //   'user',
      // ])
      .getMany();

    // Get files shared with the user via folders
    const folderSharedFiles = await this.fileRepository
      .createQueryBuilder('file')
      .innerJoin('file.folder', 'folder')
      .innerJoin('folder.permissions', 'folderPermission')
      // .leftJoinAndSelect('file.owner', 'user')
      .where('folderPermission.userId = :userId', { userId })
      // .select([
      //   'file.id',
      //   'file.name',
      //   'file.url',
      //   'file.size',
      //   'file.mimeType',
      //   'file.lastModified',
      //   'user',
      //   'folder.id',
      //   'folder.name',
      // ])
      .getMany();

    // Get files shared via user groups
    const groupSharedFiles = await this.fileRepository
      .createQueryBuilder('file')
      .innerJoin('file.folder', 'folder')
      .innerJoin('folder.groups', 'group')
      .innerJoin('group.users', 'groupUser')
      // .leftJoinAndSelect('file.owner', 'user')
      .where('groupUser.id = :userId', { userId })
      // .select([
      //   'file.id',
      //   'file.name',
      //   'file.url',
      //   'file.size',
      //   'file.mimeType',
      //   'file.lastModified',
      //   'user',
      //   'folder.id',
      //   'folder.name',
      //   'group.id',
      //   'group.name',
      // ])
      .getMany();

    // Combine all files and remove duplicates
    const allSharedFiles = [
      ...directlySharedFiles,
      ...folderSharedFiles,
      ...groupSharedFiles,
    ];

    const uniqueSharedFiles = this.removeDuplicateFiles(allSharedFiles);

    return uniqueSharedFiles;
  }

  // PRIVATE INTERNAL USE ONLY

  private async hasAccessToFile(file: File, user: User): Promise<boolean> {
    // Check if the user is the owner of the file
    if (file.owner.id === user.id) {
      return true;
    }

    // Check if the user has an admin role (ADMIN role has full access)
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Check if the file is shared with the user (Shared Link or Permission-based access)
    const sharedAccess = await this.permissionsRepository.findOne({
      where: { file: { id: file.id }, user: { id: user.id } },
    });

    if (sharedAccess) {
      return true;
    }

    // If none of the above conditions are met, the user does not have access
    return false;
  }

  createReadStream(buffer: Buffer): Readable {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null); // End the stream
    return stream;
  }

  private removeDuplicateFiles(files: File[]): File[] {
    const fileMap = new Map<string, File>();
    files.forEach((file) => {
      fileMap.set(file.id, file);
    });
    return Array.from(fileMap.values());
  }

  private bufferToBase64(blob: Buffer): string {
    return blob.toString('base64');
  }
}

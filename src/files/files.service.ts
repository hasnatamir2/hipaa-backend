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

@Injectable()
export class FilesService {
  private supabase: SupabaseClient;
  private readonly bucketName: string;

  constructor(
    @InjectRepository(File) private fileRepository: Repository<File>,
    @InjectRepository(Folder) private folderRepository: Repository<Folder>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
    private readonly activityLogService: ActivityLogsService,

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

  private blobToBase64(arrayBuffer: any): string {
    return Buffer.from(arrayBuffer).toString('base64');
  }

  async uploadFile(
    uploadFileDto: UploadFileDto,
    fileBuffer: Buffer,
    user: User,
  ): Promise<File> {
    const secretKey =
      this.configService.get<string>('JWT_SECRET_KEY') || 'secret-file';
    const encryptedFile = EncryptionUtil.encryptFile(fileBuffer, secretKey);
    // const fileBufferEncrypted = Buffer.from(encryptedFile);

    const uniqueFilename = `${Date.now()}-${uploadFileDto.filename}`;
    console.log('Encrypted Data:', encryptedFile);

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(uniqueFilename, encryptedFile, {
        contentType: 'application/octet-stream',
      });

    if (error) {
      throw new Error('File upload failed: ' + error.message);
    }
    const file = new File();
    file.name = uploadFileDto.filename;
    file.url = data.fullPath;
    file.size = fileBuffer.byteLength;
    file.owner = user;

    if (uploadFileDto.folderId) {
      const folder = await this.folderRepository.findOne({
        where: { id: uploadFileDto.folderId },
      });
      if (!folder) {
        throw new NotFoundException('Folder not found');
      }
      file.folder = folder;
    }
    await this.activityLogService.logAction(
      user.id,
      ActivityLogType.UPLOAD,
      undefined,
      'FILE',
    );

    return this.fileRepository.save(file);
  }

  async downloadFile(fileKey: string) {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .download(fileKey);

    if (error || !data) {
      throw new NotFoundException('File not found');
    }
    const arrayBuffer = await data.text();
    // console.log('Encrypted Data:----', arrayBuffer);
    // const encryptedBase64 = this.blobToBase64(arrayBuffer);
    const decryptedFile = EncryptionUtil.decryptFile(
      arrayBuffer,
      this.configService.get<string>('JWT_SECRET_KEY') || 'secret-file',
    );

    return this.createReadStream(decryptedFile);
  }

  async getFiles(folderId: string, user: User): Promise<File[]> {
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
      });
    } else {
      // Return all files user has access to
      return await this.fileRepository.find({
        where: { owner: { id: user.id } },
      });
    }
  }

  async getFileDetails(fileId: string, user: User): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
      relations: ['owner'],
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Check if the user has permission to access the file
    if (
      file.owner.id !== user.id &&
      !(await this.hasAccessToFile(file, user))
    ) {
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
      where: { file: file, user: user },
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
}

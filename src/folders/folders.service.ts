import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Folder } from './entities/folder.entity/folder.entity';
import { CreateFolderDto } from './dto/create-folder.dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto/update-folder.dto';
import { File } from '../files/entities/file.entity/file.entity';
import { User } from 'src/users/entities/user.entity/user.entity';
import { Permission } from 'src/permissions/entities/permission.entity/permission.entity';
import {
  Level,
  PermissionLevel,
} from 'src/common/constants/permission-level/permission-level.enum';

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(Folder) private folderRepository: Repository<Folder>,
    @InjectRepository(File) private fileRepository: Repository<File>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(createFolderDto: CreateFolderDto): Promise<Folder> {
    const folder = this.folderRepository.create(createFolderDto);
    return this.folderRepository.save(folder);
  }

  async update(id: string, updateFolderDto: UpdateFolderDto): Promise<Folder> {
    const folder = await this.folderRepository.findOne({ where: { id } });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    Object.assign(folder, updateFolderDto);
    return this.folderRepository.save(folder);
  }

  async delete(id: string): Promise<void> {
    const folder = await this.folderRepository.findOne({ where: { id } });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    await this.folderRepository.remove(folder);
  }

  async getFilesInFolder(folderId: string, user: User): Promise<File[]> {
    // Get the user and their permissions
    const userResponse = await this.userRepository.findOne({
      where: { id: user.id },
    });
    if (!userResponse) {
      throw new Error('User not found');
    }

    const folder = await this.folderRepository.findOne({
      where: { id: folderId },
      relations: ['files', 'permissions'],
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    const folderPermission = await this.permissionRepository.findOne({
      where: { folder: { id: folderId }, user: { id: user.id } },
    });

    // If no folder-level permission is found, deny access
    if (
      !folderPermission ||
      Level.indexOf(folderPermission.permissionLevel) <
        Level.indexOf(PermissionLevel.VIEW)
    ) {
      throw new ForbiddenException(
        'You do not have permission to view this folder',
      );
    }
    const accessibleFiles: File[] = folder.files;

    // NOT COMPUTE FRIENDLY but something like this
    // TODO: check file-level permissions on when file is accessed
    // for (const file of folder.files) {
    //   // Find permission for the user on the specific file
    //   const filePermission = await this.permissionRepository.findOne({
    //     where: { file: { id: file.id }, user: { id: user.id } },
    //   });

    //   // Check if user has at least VIEW permission on the file
    //   if (
    //     filePermission &&
    //     filePermission.permissionLevel >= PermissionLevel.VIEW
    //   ) {
    //     accessibleFiles.push(file);
    //   }
    // }

    return accessibleFiles;
  }

  async assignFileToFolder(folderId: string, fileId: string): Promise<Folder> {
    const folder = await this.folderRepository.findOne({
      where: { id: folderId },
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    const file = await this.fileRepository.findOne({ where: { id: fileId } });
    if (!file) {
      throw new NotFoundException('File not found');
    }

    file.folder = folder;
    await this.fileRepository.save(file);

    return folder;
  }
}

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
import { PermissionsService } from 'src/permissions/permissions.service';

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(Folder) private folderRepository: Repository<Folder>,
    @InjectRepository(File) private fileRepository: Repository<File>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    private readonly permissionsService: PermissionsService,
  ) {}

  async create(createFolderDto: CreateFolderDto, user: User): Promise<Folder> {
    // const userData = await this.userRepository.findOne({
    //   where: { id: user.id },
    // });

    // if (!userData) {
    //   throw new NotFoundException('User not found');
    // }

    const folder = new Folder();
    folder.owner = user;
    folder.name = createFolderDto.name;

    const savedFolder = await this.folderRepository.save(folder);
    await this.permissionsService.setDefaultFolderPermissions(
      savedFolder,
      user,
    );
    return savedFolder;
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

    await this.permissionsService.deletePermissionsByFolderId(id);

    await this.folderRepository.remove(folder);
  }

  async getAll(): Promise<Folder[]> {
    const folders = this.folderRepository.find();
    return folders;
  }

  async getFoldersByUserId(user: User): Promise<Folder[]> {
    if (!user)
      throw new ForbiddenException(
        'You do not have permission to view this folder',
      );

    const folder: Folder[] = await this.folderRepository.find({
      where: { owner: { id: user.id } },
    });

    return folder;
  }

  async getFoldersWithFilesByUserId(user: User): Promise<Folder[]> {
    if (!user)
      throw new ForbiddenException(
        'You do not have permission to view this folder',
      );
    const folder: Folder[] = await this.folderRepository
      .createQueryBuilder('folder')
      .leftJoinAndSelect('folder.files', 'file') // Joining the files table
      .where('folder.owner = :userId', { userId: user.id }) // Filter by user
      .loadRelationCountAndMap('folder.totalFiles', 'folder.files') // Count files per folder
      .getMany();

    return folder;
  }

  async findAccessibleFolders(userId: string): Promise<Folder[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['groups'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get folder access from direct assignments to the user or via user groups
    const accessibleFolders = await this.folderRepository
      .createQueryBuilder('folder')
      .leftJoinAndSelect('folder.groups', 'group') // Join and select groups related to folder
      .leftJoinAndSelect('group.users', 'groupUser') // Join and select users in groups
      .leftJoinAndSelect('folder.owner', 'user') // Join and select the owner of the folder
      .where(
        'folder.owner = :userId OR user.id = :userId OR groupUser.id = :userId',
        { userId },
      )
      .getMany();

    // Map folders to include group name if shared by a group
    const foldersWithGroupInfo = accessibleFolders.map((folder) => {
      return {
        ...folder,
        groupName: folder.groups?.length > 0 ? folder.groups[0]?.name : null, // Add group name if shared
      };
    });

    return foldersWithGroupInfo;
  }

  async getFilesInFolder(folderId: string, user: User): Promise<Folder> {
    // Get the user and their permissions
    const userResponse = await this.userRepository.findOne({
      where: { id: user.id },
    });
    if (!userResponse) {
      throw new Error('User not found');
    }

    const folder = await this.folderRepository.findOne({
      where: { id: folderId },
      relations: ['files', 'permissions', 'accessibleByGroups'],
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }
    // console.log('folder', folder);

    // const hasAccess = folder.accessibleByGroups.some((group) =>
    //   user.groups.find((userGroup) => userGroup.id === group.id),
    // );

    // if (!hasAccess) {
    //   throw new ForbiddenException('You do not have access to this folder.');
    // }

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
    const responseFolder = folder;
    responseFolder.files = accessibleFiles;

    return responseFolder;
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
    file.lastModified = new Date();
    await this.fileRepository.save(file);

    return folder;
  }
}

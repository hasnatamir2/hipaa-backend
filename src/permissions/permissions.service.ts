import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity/permission.entity';
import { SetPermissionDto } from './dto/set-permission.dto/set-permission.dto';
import { User } from '../users/entities/user.entity/user.entity';
import { File } from '../files/entities/file.entity/file.entity';
import { Folder } from '../folders/entities/folder.entity/folder.entity';
import {
  PermissionLevel,
  ResourceType,
} from '../common/constants/permission-level/permission-level.enum';
import { NotificationService } from '../notifications/notifications.service';
import { NOTIFICATIONS_TYPE } from 'src/common/constants/notifications/notifications-type.enum';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    @InjectRepository(Folder)
    private readonly folderRepository: Repository<Folder>,
    private readonly notificationService: NotificationService,
  ) {}

  async setPermission(
    dto: SetPermissionDto,
    resourceType: ResourceType,
    newPermissionLevel: PermissionLevel,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user) throw new Error('User not found');

    // Fetch user's current permission for the file/folder
    const userPermission = await this.getUserPermission(
      user.id,
      resourceType === ResourceType.FOLDER ? null : dto.resourceId,
      resourceType === ResourceType.FILE ? null : dto.resourceId,
    );

    if (!userPermission) {
      throw new ForbiddenException(
        'You do not have access to this file or folder.',
      );
    }

    // Validate if the user has enough permission level
    if (
      !this.canGrantPermission(
        userPermission.permissionLevel,
        newPermissionLevel,
      )
    ) {
      throw new ForbiddenException(
        'You do not have sufficient permission to grant this level.',
      );
    }

    let resource;
    if (resourceType === ResourceType.FILE) {
      resource = await this.fileRepository.findOne({
        where: { id: dto.resourceId },
      });
      if (!resource) throw new Error('File not found');
    } else {
      resource = await this.folderRepository.findOne({
        where: { id: dto.resourceId },
      });
      if (!resource) throw new Error('Folder not found');
    }

    const permission = new Permission();
    permission.user = user;
    permission.canRead = dto.canRead;
    permission.canWrite = dto.canWrite;
    permission.canShare = dto.canShare;
    permission.canDelete = dto.canDelete;

    if (resourceType === ResourceType.FILE) {
      permission.file = resource;
    } else {
      permission.folder = resource;
    }
    this.notificationService.sendNotification({
      // TODO: integrate 3rd party notification service
      type: NOTIFICATIONS_TYPE.EMAIL,
      recipient: user.email,
      message: `You have been granted new permissions on ${resource.name}`,
    });

    return this.permissionRepository.save(permission);
  }

  async getPermissions(
    userId: string,
    resourceId: string,
    resourceType: ResourceType,
  ) {
    const query = this.permissionRepository
      .createQueryBuilder('permission')
      .leftJoinAndSelect('permission.user', 'user')
      .where('user.id = :userId', { userId });

    if (resourceType === ResourceType.FILE) {
      query.andWhere('permission.file.id = :resourceId', { resourceId });
    } else {
      query.andWhere('permission.folder.id = :resourceId', { resourceId });
    }

    return query.getMany();
  }

  //
  //
  //
  // PRIVATE METHODS
  //
  //
  // Helper function to fetch current user's permission on file/folder
  private async getUserPermission(
    userId: string,
    fileId: string | null,
    folderId: string | null,
  ) {
    return this.permissionRepository.findOne({
      where: {
        user: { id: userId },
        ...(fileId ? { file: { id: fileId } } : {}),
        ...(folderId ? { folder: { id: folderId } } : {}),
      },
    });
  }

  // Logic to check if the user can grant a specific permission level
  private canGrantPermission(
    userPermissionLevel: PermissionLevel,
    newPermissionLevel: PermissionLevel,
  ) {
    const levels = [
      PermissionLevel.VIEW,
      PermissionLevel.SHARE,
      PermissionLevel.EDIT,
      PermissionLevel.ADMIN,
    ];

    const userLevelIndex = levels.indexOf(userPermissionLevel);
    const newLevelIndex = levels.indexOf(newPermissionLevel);

    return userLevelIndex >= newLevelIndex;
  }
}

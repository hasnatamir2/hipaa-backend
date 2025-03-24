import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  // UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from './entities/permission.entity/permission.entity';
import { SetPermissionDto } from './dto/set-permission.dto/set-permission.dto';
import { User } from '../users/entities/user.entity/user.entity';
import { File } from '../files/entities/file.entity/file.entity';
import { Folder } from '../folders/entities/folder.entity/folder.entity';
import {
  AccessLevel,
  Level,
  PermissionLevel,
  ResourceType,
} from '../common/constants/permission-level/permission-level.enum';
import { NotificationService } from '../notifications/notifications.service';
import { NOTIFICATIONS_TYPE } from 'src/common/constants/notifications/notifications-type.enum';
import { UpdatePermissionDto } from './dto/update-permission.dto/update-permission.dto';
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';
import { ActivityLogType } from 'src/common/constants/activity-logs/activity-logs';
import { Group } from 'src/group/entities/group.entity';

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
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,

    private readonly notificationService: NotificationService,
    private readonly activityLogService: ActivityLogsService,
  ) {}

  async setPermission(
    dto: SetPermissionDto,
    resourceType: ResourceType,
    newPermissionLevel: PermissionLevel,
  ) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) throw new NotFoundException('User not found');

    // Fetch user's current permission for the file/folder
    const userPermission = await this.getUserPermission(
      user.id,
      resourceType === ResourceType.FOLDER ? null : dto.resourceId,
      resourceType === ResourceType.FILE ? null : dto.resourceId,
    );

    if (userPermission) {
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
    }

    let resource;
    if (resourceType === ResourceType.FILE) {
      resource = await this.fileRepository.findOne({
        where: { id: dto.resourceId },
      });
      if (!resource) throw new NotFoundException('File not found');
    } else {
      resource = await this.folderRepository.findOne({
        where: { id: dto.resourceId },
      });
      if (!resource) throw new NotFoundException('Folder not found');
    }

    const permission = new Permission();
    permission.user = user;
    permission.accessLevel = dto.accessLevel;
    // permission.permissionLevel = newPermissionLevel;

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

  async setDefaultFolderPermissions(folder: Folder, user: User): Promise<void> {
    const permission = new Permission();
    permission.folder = folder;
    permission.user = user;
    permission.accessLevel = AccessLevel.WRITE;
    permission.permissionLevel = PermissionLevel.ADMIN;

    await this.permissionRepository.save(permission);
  }

  async setDefaultFilePermissions(file: File, user: User): Promise<void> {
    const permission = new Permission();
    permission.file = file;
    permission.user = user;
    permission.accessLevel = AccessLevel.WRITE;
    permission.permissionLevel = PermissionLevel.ADMIN;

    await this.permissionRepository.save(permission);
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

  async updatePermission(
    updatePermissionDto: UpdatePermissionDto,
    resourceType: ResourceType,
    permissionLevel: PermissionLevel,
    resourceId: string,
    userId: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) throw new ForbiddenException('User not found');

    // Fetch user's current permission for the file/folder
    const userPermission = await this.getUserPermission(
      user.id,
      resourceType === ResourceType.FOLDER ? null : resourceId,
      resourceType === ResourceType.FILE ? null : resourceId,
    );

    if (!userPermission) {
      throw new ForbiddenException(
        'You do not have access to this file or folder.',
      );
    }

    // Validate if the user has enough permission level
    if (
      !this.canGrantPermission(userPermission.permissionLevel, permissionLevel)
    ) {
      throw new ForbiddenException(
        'You do not have sufficient permission to grant this level.',
      );
    }

    let resource;
    if (resourceType === ResourceType.FILE) {
      resource = await this.fileRepository.findOne({
        where: { id: resourceId },
      });
      if (!resource) throw new NotFoundException('File not found');
    } else {
      resource = await this.folderRepository.findOne({
        where: { id: resourceId },
      });
      if (!resource) throw new NotFoundException('Folder not found');
    }

    const permission = new Permission();
    permission.user = user;
    permission.accessLevel = updatePermissionDto.accessLevel;

    if (resourceType === ResourceType.FILE) {
      permission.file = resource;
    } else {
      permission.folder = resource;
    }

    await this.activityLogService.logAction(
      user.id,
      ActivityLogType.PERMISSION_CHANGED,
      resourceId,
      resourceType,
    );

    return this.permissionRepository.save(permission);
  }

  async deletePermissionsByFolderId(folderId: string): Promise<void> {
    await this.permissionRepository.delete({ folder: { id: folderId } });
  }

  async deletePermissionsByFileId(fileId: string): Promise<void> {
    await this.permissionRepository.delete({ file: { id: fileId } });
  }

  async assignPermissionsToUsers(
    emails: string[],
    fileId: string,
    accessLevel: AccessLevel,
  ): Promise<void> {
    const users = await this.userRepository.find({
      where: { email: In(emails) },
    });
    const file = await this.fileRepository.findOne({ where: { id: fileId } });
    if (!file) throw new NotFoundException('File not found');
    const permissions = users.map((user) =>
      this.permissionRepository.create({
        user,
        file,
        accessLevel,
      }),
    );
    await this.permissionRepository.save(permissions);
  }

  async assignPermissionToGroup(
    groupId: string,
    fileId: string,
    accessLevel: 'read' | 'write',
  ): Promise<void> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['users'],
    });
    if (!group) throw new NotFoundException('Group not found');
    const file = await this.fileRepository.findOne({ where: { id: fileId } });
    if (!file) throw new NotFoundException('File not found');
    const permissions = group.users.map((user) =>
      // this.permissionRepository.create({
      //   user,
      //   file,
      //   accessLevel,
      //   permissionLevel: PermissionLevel.ADMIN,
      // }),
      {
        const permission = new Permission();
        permission.user = user;
        permission.file = file;
        permission.accessLevel = accessLevel;
        permission.permissionLevel = PermissionLevel.ADMIN;
        return permission;
      },
    );
    await this.permissionRepository.save(permissions);
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
    const userLevelIndex = Level.indexOf(userPermissionLevel);
    const newLevelIndex = Level.indexOf(newPermissionLevel);

    return userLevelIndex >= newLevelIndex;
  }

  async checkPermission(
    fileId: string,
    userId: string,
    requiredPermission: Permission,
  ): Promise<boolean> {
    const permission = await this.permissionRepository
      .createQueryBuilder('permission')
      .where('permission.file.id = :fileId', { fileId })
      .andWhere('permission.user.id = :userId', { userId })
      .andWhere('permission.permission = :requiredPermission', {
        requiredPermission,
      })
      .getOne();

    return !!permission;
  }

  async canViewFile(userId: string, fileId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['groups'],
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const file = await this.fileRepository.findOne({
      where: { id: fileId },
      relations: ['folder', 'folder.groups'],
    });

    if (!file) {
      throw new ForbiddenException('File not found');
    }

    // Check if the user has direct permissions to the file
    const hasFilePermission = await this.permissionRepository.findOne({
      where: {
        user: { id: userId },
        file: { id: fileId },
      },
    });

    if (hasFilePermission) {
      return true; // User has direct file permission
    }

    // Check if the user has permissions via group or folder
    if (file.folder) {
      const hasFolderPermission = await this.permissionRepository.findOne({
        where: {
          user: { id: userId },
          folder: { id: file.folder.id },
        },
      });

      if (hasFolderPermission) {
        return true; // User has folder-level permission
      }

      // Check group-based permissions
      const userGroupIds = user.groups.map((group) => group.id);
      const folderGroupIds = file.folder.groups.map((group) => group.id);

      const commonGroupIds = userGroupIds.filter((id) =>
        folderGroupIds.includes(id),
      );

      if (commonGroupIds.length > 0) {
        return true; // User belongs to a group that has access to the folder
      }
    }

    // If no permission found, deny access
    throw new ForbiddenException(
      'You do not have permission to view this file',
    );
  }
}

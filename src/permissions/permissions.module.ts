// permissions/permissions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { Permission } from './entities/permission.entity/permission.entity';
import { User } from '../users/entities/user.entity/user.entity';
import { File } from '../files/entities/file.entity/file.entity';
import { Folder } from '../folders/entities/folder.entity/folder.entity';
import { NotificationsModule } from '../notifications/notifications.module'; // Import NotificationsModule here
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';
import { ActivityLog } from 'src/activity-logs/entities/activity-log.entity/activity-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, User, File, Folder, ActivityLog]), // Inject entities directly
    NotificationsModule, // Importing NotificationsModule here
  ],
  providers: [PermissionsService, ActivityLogsService],
  controllers: [PermissionsController],
})
export class PermissionsModule {}

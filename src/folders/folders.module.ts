import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoldersController } from './folders.controller';
import { FoldersService } from './folders.service';
import { Folder } from './entities/folder.entity/folder.entity';
import { File } from '../files/entities/file.entity/file.entity';
import { User } from 'src/users/entities/user.entity/user.entity';
import { Permission } from 'src/permissions/entities/permission.entity/permission.entity';
import { ActivityLog } from 'src/activity-logs/entities/activity-log.entity/activity-log.entity';
import { PermissionsService } from 'src/permissions/permissions.service';
import { NotificationsModule } from '../notifications/notifications.module'; // Import NotificationsModule here
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';
import { GroupModule } from 'src/group/group.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Folder, File, User, Permission, ActivityLog]),
    NotificationsModule,
    GroupModule,
  ],
  controllers: [FoldersController],
  providers: [FoldersService, PermissionsService, ActivityLogsService],
})
export class FoldersModule {}

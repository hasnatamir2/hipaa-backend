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

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, User, File, Folder]), // Inject entities directly
    NotificationsModule, // Importing NotificationsModule here
  ],
  providers: [PermissionsService],
  controllers: [PermissionsController],
})
export class PermissionsModule {}

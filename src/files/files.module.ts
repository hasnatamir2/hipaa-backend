import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity/file.entity';
import { FileVersion } from './entities/file.entity/file-version.entity';
// import { S3Service } from '../shared/s3/s3.service';
import { Folder } from '../folders/entities/folder.entity/folder.entity'; // <-- Import Folder entity
import { ConfigModule } from '../config/config.module';
import { S3Module } from 'src/shared/s3/s3.module';
import { SupabaseService } from 'src/shared/supabase/supabase.service';
import { User } from 'src/users/entities/user.entity/user.entity';
import { Permission } from 'src/permissions/entities/permission.entity/permission.entity';
import { ActivityLog } from 'src/activity-logs/entities/activity-log.entity/activity-log.entity';
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';
import { PermissionsService } from 'src/permissions/permissions.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { Group } from 'src/group/entities/group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      File,
      Folder,
      User,
      Permission,
      ActivityLog,
      FileVersion,
      Group,
    ]),
    ConfigModule,
    S3Module,
    NotificationsModule,
  ],
  controllers: [FilesController],
  providers: [
    FilesService,
    SupabaseService,
    ActivityLogsService,
    PermissionsService,
  ],
  exports: [TypeOrmModule],
})
export class FilesModule {}

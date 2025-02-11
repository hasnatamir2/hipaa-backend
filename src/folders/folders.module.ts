import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoldersController } from './folders.controller';
import { FoldersService } from './folders.service';
import { Folder } from './entities/folder.entity/folder.entity';
import { File } from '../files/entities/file.entity/file.entity';
import { User } from 'src/users/entities/user.entity/user.entity';
import { Permission } from 'src/permissions/entities/permission.entity/permission.entity';
import { ActivityLog } from 'src/activity-logs/entities/activity-log.entity/activity-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Folder, File, User, Permission, ActivityLog]),
  ],
  controllers: [FoldersController],
  providers: [FoldersService],
})
export class FoldersModule {}

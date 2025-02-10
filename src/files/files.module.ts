import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity/file.entity';
// import { S3Service } from '../shared/s3/s3.service';
import { Folder } from '../folders/entities/folder.entity/folder.entity'; // <-- Import Folder entity
import { ConfigModule } from '../config/config.module';
import { S3Module } from 'src/shared/s3/s3.module';
import { SupabaseService } from 'src/shared/supabase/supabase.service';
import { User } from 'src/users/entities/user.entity/user.entity';
import { Permission } from 'src/permissions/entities/permission.entity/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([File, Folder, User, Permission]),
    ConfigModule,
    S3Module,
  ],
  controllers: [FilesController],
  providers: [FilesService, SupabaseService],
  exports: [TypeOrmModule],
})
export class FilesModule {}

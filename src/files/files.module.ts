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

@Module({
  imports: [TypeOrmModule.forFeature([File, Folder]), ConfigModule, S3Module],
  controllers: [FilesController],
  providers: [FilesService, SupabaseService],
})
export class FilesModule {}

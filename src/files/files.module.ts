import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity/file.entity';
import { S3Service } from '../shared/s3/s3.service';
import { Folder } from '../folders/entities/folder.entity/folder.entity'; // <-- Import Folder entity

@Module({
  imports: [TypeOrmModule.forFeature([File, Folder])],
  controllers: [FilesController],
  providers: [FilesService, S3Service],
})
export class FilesModule {}

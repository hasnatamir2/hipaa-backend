import { Module } from '@nestjs/common';
import { FoldersController } from './folders.controller';
import { FoldersService } from './folders.service';
import { FilesService } from '../files/files.service';

@Module({
  controllers: [FoldersController],
  providers: [FoldersService, FilesService],
})
export class FoldersModule {}

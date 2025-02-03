import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoldersController } from './folders.controller';
import { FoldersService } from './folders.service';
import { Folder } from './entities/folder.entity/folder.entity';
import { File } from '../files/entities/file.entity/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Folder, File])],
  controllers: [FoldersController],
  providers: [FoldersService],
})
export class FoldersModule {}

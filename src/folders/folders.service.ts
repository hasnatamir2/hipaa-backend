import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Folder } from './entities/folder.entity/folder.entity';
import { CreateFolderDto } from './dto/create-folder.dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto/update-folder.dto';
import { File } from '../files/entities/file.entity/file.entity';

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(Folder) private folderRepository: Repository<Folder>,
    @InjectRepository(File) private fileRepository: Repository<File>,
  ) {}

  async create(createFolderDto: CreateFolderDto): Promise<Folder> {
    const folder = this.folderRepository.create(createFolderDto);
    return this.folderRepository.save(folder);
  }

  async update(id: number, updateFolderDto: UpdateFolderDto): Promise<Folder> {
    const folder = await this.folderRepository.findOne({ where: { id } });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    Object.assign(folder, updateFolderDto);
    return this.folderRepository.save(folder);
  }

  async delete(id: number): Promise<void> {
    const folder = await this.folderRepository.findOne({ where: { id } });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    await this.folderRepository.remove(folder);
  }

  async assignFileToFolder(folderId: number, fileId: number): Promise<Folder> {
    const folder = await this.folderRepository.findOne({
      where: { id: folderId },
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    const file = await this.fileRepository.findOne({ where: { id: fileId } });
    if (!file) {
      throw new NotFoundException('File not found');
    }

    file.folder = folder;
    await this.fileRepository.save(file);

    return folder;
  }
}

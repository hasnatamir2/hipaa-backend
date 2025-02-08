import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Folder } from 'src/folders/entities/folder.entity/folder.entity';
import { File } from './entities/file.entity/file.entity';
import { UploadFileDto } from './dto/upload-file.dto/upload-file.dto';
import { SupabaseService } from '../shared/supabase/supabase.service';

@Injectable()
export class FilesService {
  constructor(
    private readonly supabaseService: SupabaseService,
    @InjectRepository(File) private fileRepository: Repository<File>,
    @InjectRepository(Folder) private folderRepository: Repository<Folder>,
  ) {}

  async uploadFile(
    uploadFileDto: UploadFileDto,
    fileBuffer: Buffer,
  ): Promise<File> {
    const uploadedFile = await this.supabaseService.uploadFile(
      uploadFileDto.filename,
      fileBuffer,
    );

    const file = new File();
    file.name = uploadFileDto.filename;
    file.url = uploadedFile.publicURL; // Get the public URL of the file

    // If folder ID is provided, associate file with folder
    if (uploadFileDto.folderId) {
      const folder = await this.folderRepository.findOne({
        where: { id: uploadFileDto.folderId },
      });
      if (!folder) {
        throw new NotFoundException('Folder not found');
      }
      file.folder = folder;
    }

    return this.fileRepository.save(file);
  }

  async downloadFile(fileKey: string): Promise<Buffer> {
    const fileData = await this.supabaseService.downloadFile(fileKey);

    if (!fileData) {
      throw new Error('File not found in Supabase storage');
    }

    return fileData; // Assuming it's already a buffer
  }
}

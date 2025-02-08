import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity/file.entity';
import { Folder } from '../folders/entities/folder.entity/folder.entity';
import { UploadFileDto } from './dto/upload-file.dto/upload-file.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService {
  private supabase: SupabaseClient;

  constructor(
    @InjectRepository(File) private fileRepository: Repository<File>,
    @InjectRepository(Folder) private folderRepository: Repository<Folder>,
    private configService: ConfigService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    const supabaseKey =
      this.configService.get<string>('SUPABASE_ANON_KEY') || '';
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async uploadFile(
    uploadFileDto: UploadFileDto,
    fileBuffer: Buffer,
  ): Promise<File> {
    const { data, error } = await this.supabase.storage
      .from('files')
      .upload(uploadFileDto.filename, fileBuffer);

    if (error) {
      throw new Error('File upload failed: ' + error.message);
    }

    const file = new File();
    file.name = uploadFileDto.filename;
    file.url = data.path;

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
    const { data, error } = await this.supabase.storage
      .from('files')
      .download(fileKey);

    if (error || !data) {
      throw new NotFoundException('File not found');
    }

    return Buffer.from(await data.arrayBuffer());
  }
}

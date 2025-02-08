import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity/file.entity';
import { Folder } from '../folders/entities/folder.entity/folder.entity';
import { UploadFileDto } from './dto/upload-file.dto/upload-file.dto';
import { ConfigService } from '@nestjs/config';
import { EncryptionUtil } from 'src/common/utils/encryption.util';

@Injectable()
export class FilesService {
  private supabase: SupabaseClient;
  private readonly bucketName: string;

  constructor(
    @InjectRepository(File) private fileRepository: Repository<File>,
    @InjectRepository(Folder) private folderRepository: Repository<Folder>,
    private configService: ConfigService,
  ) {
    const supabaseUrl =
      this.configService.get<string>('SUPABASE_UPLOAD_URL') || '';
    const supabaseKey =
      this.configService.get<string>('SUPABASE_ANON_KEY') || '';
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.bucketName =
      this.configService.get<string>('SUPABASE_BUCKET_NAME') || 'files';
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob); // Converts to base64
    });
  }

  async uploadFile(
    uploadFileDto: UploadFileDto,
    fileBuffer: Buffer,
  ): Promise<File> {
    const secretKey =
      this.configService.get<string>('JWT_SECRET_KEY') || 'secret-file';
    const encryptedFile = EncryptionUtil.encryptFile(fileBuffer, secretKey);
    const fileBufferEncrypted = Buffer.from(encryptedFile);

    const uniqueFilename = `${Date.now()}-${uploadFileDto.filename}`;

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(uniqueFilename, fileBufferEncrypted);

    if (error) {
      throw new Error('File upload failed: ' + error.message);
    }
    const file = new File();
    file.name = uploadFileDto.filename;
    file.url = data.fullPath;
    file.size = fileBuffer.byteLength;

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
      .from(this.bucketName)
      .download(fileKey);

    if (error || !data) {
      throw new NotFoundException('File not found');
    }

    const encryptedBase64 = await this.blobToBase64(data as Blob);
    const decryptedFile = EncryptionUtil.decryptFile(
      encryptedBase64,
      this.configService.get<string>('JWT_SECRET_KEY') || 'secret-file',
    );

    return Buffer.from(decryptedFile, 'utf8');
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { AwsConfigService } from '../config/aws.config/aws.config.service';
import { EncryptionUtil } from '../common/utils/encryption.util';
import { UploadFileDto } from './dto/upload-file.dto/upload-file.dto'; // Assuming you have a DTO for uploads
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Folder } from 'src/folders/entities/folder.entity/folder.entity';
import { File } from './entities/file.entity/file.entity';

@Injectable()
export class FilesService {
  constructor(
    private readonly awsConfigService: AwsConfigService,
    @InjectRepository(File) private fileRepository: Repository<File>,
    @InjectRepository(Folder) private folderRepository: Repository<Folder>,
  ) {}

  async uploadFile(
    uploadFileDto: UploadFileDto,
    fileBuffer: Buffer,
  ): Promise<File> {
    const secretKey = 'your-secret-key'; // Replace with a secure key
    const encryptedFile = EncryptionUtil.encryptFile(fileBuffer, secretKey);
    const fileBufferEncrypted = Buffer.from(encryptedFile);

    const uploadedFile = await this.awsConfigService.uploadFileToS3(
      fileBufferEncrypted,
      uploadFileDto.filename,
    );
    const file = new File();
    file.name = uploadFileDto.filename;
    file.url = uploadedFile;
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
    const secretKey = 'your-secret-key'; // Replace with the same key
    const fileData = await this.awsConfigService.downloadFileFromS3(fileKey);

    if (!fileData.Body || !(fileData.Body instanceof Buffer)) {
      throw new Error('Invalid file data');
    }
    const encryptedFile = fileData.Body.toString('utf-8'); // Convert from Buffer to string
    return EncryptionUtil.decryptFile(encryptedFile, secretKey);
  }
}

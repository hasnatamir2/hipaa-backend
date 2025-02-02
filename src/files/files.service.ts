import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity/file.entity';
import { S3Service } from '../shared/s3/s3.service';
import { CreateFileDto } from './dto/create-file.dto/create-file.dto';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly s3Service: S3Service,
  ) {}

  // Upload a file and save its metadata in the database
  async uploadFile(
    createFileDto: CreateFileDto,
    file: Express.Multer.File,
  ): Promise<File> {
    const { folder } = createFileDto;

    try {
      // Upload file to S3 and get the file URL
      const fileUrl = await this.s3Service.uploadFile(file, folder);

      // Save file metadata in the database
      const newFile = this.fileRepository.create({
        key: `${folder}/${file.originalname}`,
        url: fileUrl,
        size: file.size,
        mimeType: file.mimetype,
      });

      // Save the file record
      await this.fileRepository.save(newFile);
      this.logger.log(`File uploaded and saved to DB: ${newFile.url}`);

      return newFile;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new Error('File upload failed');
    }
  }

  // Download a file from S3
  async downloadFile(fileKey: string): Promise<Buffer> {
    try {
      return await this.s3Service.downloadFile(fileKey);
    } catch (error) {
      this.logger.error(`Failed to download file: ${error.message}`);
      throw new Error('File download failed');
    }
  }

  // Delete a file from S3 and remove its record from the database
  async deleteFile(fileKey: string): Promise<void> {
    try {
      // Delete the file from S3
      await this.s3Service.deleteFile(fileKey);

      // Delete the file record from the database
      await this.fileRepository.delete({ key: fileKey });
      this.logger.log(`File deleted from S3 and DB: ${fileKey}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw new Error('File deletion failed');
    }
  }
}

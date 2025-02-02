import { Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private readonly s3: AWS.S3;
  private readonly bucketName: string;
  private readonly logger = new Logger(S3Service.name);

  constructor(private readonly configService: ConfigService) {
    // Initialize the AWS S3 SDK
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get<string>('AWS_REGION'),
    });
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
  }

  // Upload a file to S3
  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    if (!file) {
      throw new Error('No file provided');
    }
    const filePath = `${folder}/${file.originalname}`;
    const params = {
      Bucket: this.bucketName,
      Key: filePath,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', // Or set appropriate ACL for your use case
    };

    try {
      const uploadResult = await this.s3.upload(params).promise();
      this.logger.log(`File uploaded successfully: ${uploadResult.Location}`);
      return uploadResult.Location; // Return the file's S3 URL
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new Error('File upload failed');
    }
  }

  // Download a file from S3
  async downloadFile(fileKey: string): Promise<Buffer> {
    const params = {
      Bucket: this.bucketName,
      Key: fileKey,
    };

    try {
      const file = await this.s3.getObject(params).promise();
      return file.Body as Buffer; // Return file as buffer
    } catch (error) {
      this.logger.error(`Failed to download file: ${error.message}`);
      throw new Error('File download failed');
    }
  }

  // Delete a file from S3
  async deleteFile(fileKey: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: fileKey,
    };

    try {
      await this.s3.deleteObject(params).promise();
      this.logger.log(`File deleted successfully: ${fileKey}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw new Error('File deletion failed');
    }
  }
}

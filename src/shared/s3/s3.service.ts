import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectAwsService } from 'nest-aws-sdk';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private bucketName: string;

  constructor(
    @InjectAwsService(S3) private readonly s3: S3,
    private readonly configService: ConfigService,
  ) {
    this.bucketName =
      this.configService.get<string>('AWS_S3_BUCKET_NAME') || '';
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      if (!file || !file.mimetype) {
        throw new HttpException('Invalid file', HttpStatus.BAD_REQUEST);
      }
      const fileExtension =
        typeof file.mimetype === 'string' ? file.mimetype.split('/')[1] : '';
      const fileId = uuidv4();
      const fileName = `${folder}/${fileId}.${fileExtension}`;
      const params = {
        Bucket: String(this.configService.get<string>('AWS_S3_BUCKET_NAME')),
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'private',
        // Enabling AES-256 Encryption at Rest
        ServerSideEncryption: 'AES256',
      };
      const data = await this.s3.upload(params).promise();
      return data.Location; // Returns the S3 URL
    } catch (error) {
      throw new HttpException(
        `File upload failed ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async downloadFile(fileKey: string): Promise<Buffer> {
    const params = {
      Bucket: String(this.configService.get<string>('AWS_S3_BUCKET_NAME')),
      Key: fileKey,
    };

    try {
      const data = await this.s3.getObject(params).promise();
      return data.Body as Buffer;
    } catch (error) {
      throw new HttpException(
        `File download failed ${error}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async deleteFile(fileKey: string): Promise<void> {
    const params = {
      Bucket: String(this.configService.get<string>('AWS_S3_BUCKET_NAME')),
      Key: fileKey,
    };

    try {
      await this.s3.deleteObject(params).promise();
    } catch (error) {
      throw new HttpException(
        `File deletion failed ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  getFileUrl(fileName: string): string {
    const params = {
      Bucket: this.bucketName,
      Key: fileName,
      Expires: 60 * 60, // 1 hour expiry time
    };

    try {
      return this.s3.getSignedUrl('getObject', params);
    } catch (error) {
      throw new HttpException(
        `Failed to get file URL ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

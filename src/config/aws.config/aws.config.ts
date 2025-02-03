import { Injectable } from '@nestjs/common';
import { InjectAwsService } from 'nest-aws-sdk';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsConfigService {
  constructor(
    private configService: ConfigService,
    @InjectAwsService(S3) private readonly s3: S3,
  ) {}

  async uploadFileToS3(fileBuffer: Buffer, fileName: string): Promise<string> {
    const params = {
      Bucket: String(this.configService.get<string>('AWS_BUCKET_NAME')),
      Key: fileName,
      Body: fileBuffer,
      ContentType: 'application/octet-stream',
    };

    try {
      const { Location } = await this.s3.upload(params).promise();
      return String(Location);
    } catch (error) {
      throw new Error(`Error uploading file to S3 ${error}`);
    }
  }

  async downloadFileFromS3(fileKey: string): Promise<S3.GetObjectOutput> {
    const params = {
      Bucket: String(this.configService.get<string>('AWS_BUCKET_NAME')),
      Key: fileKey,
    };

    try {
      return await this.s3.getObject(params).promise();
    } catch (error) {
      throw new Error(`Error downloading file from S3 ${error}`);
    }
  }
}

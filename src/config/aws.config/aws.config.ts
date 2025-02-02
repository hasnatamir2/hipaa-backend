import { S3 } from 'aws-sdk';

export const AwsConfig = {
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  s3: new S3({
    signatureVersion: 'v4',
  }) as S3,
  bucketName: process.env.AWS_S3_BUCKET,
};

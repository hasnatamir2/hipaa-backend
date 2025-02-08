// config.module.ts
import { Module } from '@nestjs/common';
// import { AwsConfigService } from './aws.config/aws.config.service';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

@Module({
  imports: [NestConfigModule.forRoot()],
  // providers: [AwsConfigService],
  // exports: [AwsConfigService],
})
export class ConfigModule {}

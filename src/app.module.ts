import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { FoldersModule } from './folders/folders.module';
import { PermissionsModule } from './permissions/permissions.module';
import { SharedLinksModule } from './shared-links/shared-links.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity/user.entity';
// import { S3Service } from './shared/s3/s3.service';
import { AwsSdkModule } from 'nest-aws-sdk';
import { S3 } from 'aws-sdk';
import { AwsConfigService } from './config/aws.config/aws.config.service';
import { S3Module } from './shared/s3/s3.module';
import { JwtStrategy } from './auth/guards/strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    FilesModule,
    FoldersModule,
    PermissionsModule,
    SharedLinksModule,
    ActivityLogsModule,
    S3Module,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'user',
      password: 'password',
      database: 'hipaa_db',
      entities: [User],
      synchronize: true,
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    AwsSdkModule.forRoot({
      defaultServiceOptions: {
        region: process.env.AWS_REGION,
      },
      services: [S3],
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AwsConfigService, JwtStrategy],
  exports: [JwtStrategy],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}

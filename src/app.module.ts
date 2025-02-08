import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
// import { User } from './users/entities/user.entity/user.entity';
// import { S3Service } from './shared/s3/s3.service';
// import { AwsSdkModule } from 'nest-aws-sdk';
// import { S3 } from 'aws-sdk';
// import { AwsConfigService } from './config/aws.config/aws.config.service';
// import { S3Module } from './shared/s3/s3.module';
import { JwtStrategy } from './auth/guards/strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsModule } from './notifications/notifications.module';
import { DatabaseConfig } from './config/database.config/database.config';
import { SupabaseService } from './shared/supabase/supabase.service';
import { SupabaseModule } from 'nestjs-supabase-js';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    FilesModule,
    FoldersModule,
    PermissionsModule,
    SharedLinksModule,
    ActivityLogsModule,
    // S3Module,
    TypeOrmModule.forRootAsync({
      useFactory: DatabaseConfig,
      inject: [ConfigService],
    }),
    SupabaseModule.forRootAsync({
      useFactory: () => ({
        supabaseKey: (process.env.SUPABASE_ANON_KEY as string) || '',
        supabaseUrl: (process.env.SUPABASE_URL as string) || '',
      }),
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
    }),
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy, SupabaseService],
  exports: [JwtStrategy],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}

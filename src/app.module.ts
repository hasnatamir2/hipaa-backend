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

@Module({
  imports: [
    AuthModule,
    UsersModule,
    FilesModule,
    FoldersModule,
    PermissionsModule,
    SharedLinksModule,
    ActivityLogsModule,
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
    ConfigModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}

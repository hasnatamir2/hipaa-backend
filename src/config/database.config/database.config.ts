// src/config/database.config.ts

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const DatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST') || 'your-supabase-host',
  port: Number(configService.get<number>('DB_PORT')) || 5432, // Ensuring that it's a number
  username: configService.get<string>('DB_USERNAME') || 'your-username',
  password: configService.get<string>('DB_PASSWORD') || 'your-password',
  database: configService.get<string>('DB_NAME') || 'your-database',
  synchronize: true, // Make sure to set it to 'false' in production
  autoLoadEntities: true,
});

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RolesGuard } from './auth/guards/roles/roles.guard';
import { Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoggingInterceptor } from './common/interceptors/logging/logging.interceptor';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalGuards(new RolesGuard(new Reflector(), app.get(JwtService)));
  app.useGlobalInterceptors(new LoggingInterceptor());
  // Apply ValidationPipe globally for DTO validation
  app.useGlobalPipes(new ValidationPipe());

  const frontend = process.env.FRONTEND_URL || 'http://localhost:3001';
  app.enableCors({
    origin: frontend, // Allow requests from your frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  const port = process.env.PORT || 3000;

  await app.listen(port);
}
bootstrap();

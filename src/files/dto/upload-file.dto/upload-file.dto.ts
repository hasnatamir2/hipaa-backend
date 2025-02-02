// src/files/dto/upload-file.dto.ts

import { IsString, IsNotEmpty } from '@nestjs/class-validator';

export class UploadFileDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  mimetype: string;

  @IsNotEmpty()
  size: number;
}

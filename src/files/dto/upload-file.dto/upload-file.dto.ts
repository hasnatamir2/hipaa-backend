// src/files/dto/upload-file.dto.ts

import { IsOptional } from '@nestjs/class-validator';

export class UploadFileDto {
  @IsOptional()
  folderId?: string;
}

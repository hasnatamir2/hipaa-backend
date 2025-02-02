// src/files/dto/download-file.dto.ts

import { IsNumber } from '@nestjs/class-validator';

export class DownloadFileDto {
  @IsNumber()
  id: number;
}

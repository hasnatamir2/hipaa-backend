// src/folders/dto/update-folder.dto.ts

import { IsString, IsOptional } from '@nestjs/class-validator';

export class UpdateFolderDto {
  @IsString()
  @IsOptional()
  name?: string;
}

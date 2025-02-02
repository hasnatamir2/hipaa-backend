// src/folders/dto/create-folder.dto.ts

import { IsString, IsNotEmpty } from '@nestjs/class-validator';

export class CreateFolderDto {
  @IsString()
  @IsNotEmpty()
  folderName: string;
}

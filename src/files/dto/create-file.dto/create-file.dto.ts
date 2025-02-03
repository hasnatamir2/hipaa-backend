import { IsString, IsOptional } from '@nestjs/class-validator';

export class CreateFileDto {
  @IsString()
  filename: string;

  @IsString()
  filepath: string;

  @IsOptional()
  folderId?: number; // Optional folder ID for associating the file to a folder
}

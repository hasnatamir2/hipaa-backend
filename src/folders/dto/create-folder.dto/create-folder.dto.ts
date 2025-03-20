import { IsString, IsNotEmpty, IsOptional } from '@nestjs/class-validator';

export class CreateFolderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  parentFolderId?: string;
}

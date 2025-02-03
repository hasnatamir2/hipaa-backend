import { IsString, IsNotEmpty, IsOptional } from '@nestjs/class-validator';

export class UpdateFolderDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;
}

import { IsString } from '@nestjs/class-validator';

export class CreateFileDto {
  @IsString()
  folder: string; // The folder in which the file will be stored
}

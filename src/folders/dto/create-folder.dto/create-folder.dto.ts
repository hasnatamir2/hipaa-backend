import { IsString, IsNotEmpty } from '@nestjs/class-validator';

export class CreateFolderDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

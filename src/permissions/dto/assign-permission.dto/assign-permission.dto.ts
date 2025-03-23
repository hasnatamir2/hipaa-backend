import { IsArray, IsEmail, IsEnum, IsString } from '@nestjs/class-validator';

export class AssignPermissionDto {
  @IsArray()
  @IsString({ each: true })
  @IsEmail({}, { each: true })
  emails: string[];

  @IsString()
  fileId: string;

  @IsEnum(['read', 'write'])
  accessLevel: 'read' | 'write';
}

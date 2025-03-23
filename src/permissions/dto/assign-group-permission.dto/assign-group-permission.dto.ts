import { IsEnum, IsString } from 'class-validator';

export class AssignGroupPermissionDto {
  @IsString()
  groupId: string;

  @IsString()
  fileId: string;

  @IsEnum(['read', 'write'])
  accessLevel: 'read' | 'write';
}

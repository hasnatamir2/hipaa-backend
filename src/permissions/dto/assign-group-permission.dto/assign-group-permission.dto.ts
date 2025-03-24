import { IsEnum, IsString } from 'class-validator';
import { AccessLevel } from 'src/common/constants/permission-level/permission-level.enum';

export class AssignGroupPermissionDto {
  @IsString()
  groupId: string;

  @IsString()
  fileId: string;

  @IsEnum(AccessLevel)
  accessLevel: AccessLevel;
}

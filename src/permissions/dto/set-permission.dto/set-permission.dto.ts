import { IsUUID, IsString, IsEnum } from '@nestjs/class-validator';
import { AccessLevel } from 'src/common/constants/permission-level/permission-level.enum';

export class SetPermissionDto {
  @IsString()
  email: string;

  @IsUUID()
  resourceId: string; // This can be either a file or a folder ID.

  @IsEnum(AccessLevel)
  accessLevel: AccessLevel;
}

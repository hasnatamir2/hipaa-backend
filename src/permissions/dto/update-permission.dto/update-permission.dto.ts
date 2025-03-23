import {
  AccessLevel,
  PermissionLevel,
} from 'src/common/constants/permission-level/permission-level.enum';
import { IsEnum } from '@nestjs/class-validator';

export class UpdatePermissionDto {
  @IsEnum(AccessLevel)
  accessLevel: AccessLevel; // Assign the access level

  @IsEnum(PermissionLevel)
  permissionLevel: PermissionLevel; // Assign the permission level
}

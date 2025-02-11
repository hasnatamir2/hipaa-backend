import { PermissionLevel } from 'src/common/constants/permission-level/permission-level.enum';
import { IsBoolean, IsEnum } from '@nestjs/class-validator';

export class UpdatePermissionDto {
  @IsBoolean()
  canRead?: boolean;

  @IsBoolean()
  canWrite?: boolean;

  @IsBoolean()
  canShare?: boolean;

  @IsBoolean()
  canDelete?: boolean;

  @IsEnum(PermissionLevel)
  permissionLevel: PermissionLevel; // Assign the permission level
}

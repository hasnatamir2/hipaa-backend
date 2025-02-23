import { IsBoolean, IsUUID, IsString } from '@nestjs/class-validator';

export class SetPermissionDto {
  @IsString()
  email: string;

  @IsUUID()
  resourceId: string; // This can be either a file or a folder ID.

  @IsBoolean()
  canRead: boolean;

  @IsBoolean()
  canWrite: boolean;

  @IsBoolean()
  canShare: boolean;

  @IsBoolean()
  canDelete: boolean;
}

import { IsArray, IsEmail, IsEnum, IsString } from '@nestjs/class-validator';
import { AccessLevel } from 'src/common/constants/permission-level/permission-level.enum';

export class AssignPermissionDto {
  @IsArray()
  @IsString({ each: true })
  @IsEmail({}, { each: true })
  emails: string[];

  @IsString()
  fileId: string;

  @IsEnum(AccessLevel)
  accessLevel: AccessLevel;
}

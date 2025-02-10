// src/shared-links/dto/create-shared-link.dto.ts

import {
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
} from '@nestjs/class-validator';

export class CreateSharedLinkDto {
  @IsUUID()
  fileId: string; // The file ID to share

  @IsOptional()
  @IsString()
  password: string; // Optional password for protection

  @IsOptional()
  @IsDateString()
  expiresAt?: Date; // Optional expiration date

  readonly linkToken: string;
}

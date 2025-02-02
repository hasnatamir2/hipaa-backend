import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
} from '@nestjs/class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  role: string; // Assign a role, e.g., admin or user
}

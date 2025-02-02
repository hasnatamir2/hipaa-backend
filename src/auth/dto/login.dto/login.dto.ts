import { IsEmail, IsString } from '@nestjs/class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

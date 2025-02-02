// src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity/user.entity';
import { UserRole } from 'src/common/constants/roles/roles';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() user: User) {
    return this.authService.login(user);
  }

  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('role') role: UserRole,
  ) {
    return this.authService.register(email, password, role);
  }
}

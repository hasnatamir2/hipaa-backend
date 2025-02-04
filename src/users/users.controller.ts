// src/users/users.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from 'src/common/constants/roles/roles';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles';
// import { User } from './entities/user.entity/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  @Roles(UserRole.ADMIN)
  async createUser(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('role') role: UserRole,
  ) {
    return this.usersService.createUser(email, password, role);
  }

  @Get(':email')
  async getUserByEmail(@Param('email') email: string) {
    return this.usersService.findUserByEmail(email);
  }

  @Put(':id/role')
  async updateRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.usersService.updateUserRole(id, role);
  }
}

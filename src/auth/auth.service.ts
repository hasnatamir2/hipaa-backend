// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from 'src/common/constants/roles/roles.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(payload: JwtPayload): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { id: payload.id },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  login(user: User) {
    const payload: JwtPayload = { id: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(
    email: string,
    password: string,
    role: UserRole,
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User();
    user.email = email;
    user.passwordHash = hashedPassword;
    user.role = role;
    return this.usersRepository.save(user);
  }
}

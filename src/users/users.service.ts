// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity/user.entity';
import { UserRole } from 'src/common/constants/roles/roles';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createUser(
    email: string,
    password: string,
    role: UserRole,
  ): Promise<User> {
    const user = new User();
    user.email = email;
    user.passwordHash = password;
    user.role = role;
    return this.usersRepository.save(user);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async updateUserRole(id: string, role: UserRole): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    user.role = role;
    return this.usersRepository.save(user);
  }
}

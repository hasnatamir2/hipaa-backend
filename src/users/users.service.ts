import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity/user.entity';
import { UserRole } from 'src/common/constants/roles/roles.enum';
import * as bcrypt from 'bcryptjs';

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
    const existing = await this.findUserByEmail(email);
    if (existing) {
      throw new ForbiddenException('User already exist!');
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User();
    user.email = email;
    user.passwordHash = hashedPassword;
    user.role = role;
    return this.usersRepository.save(user);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async getAllUsers(): Promise<User[] | null> {
    const pipedUserData = await this.usersRepository.find();
    return pipedUserData.map((user) => {
      return {
        ...user,
        id: user.id,
        email: user.email,
        role: user.role,
        passwordHash: '',
      };
    });
  }

  async updateUserRole(id: string, role: UserRole): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.role = role;
    return this.usersRepository.save(user);
  }
}

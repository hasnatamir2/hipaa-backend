// src/shared-links/shared-links.service.ts

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { SharedLink } from './entities/shared-link.entity/shared-link.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSharedLinkDto } from './dto/create-shared-link.dto/create-shared-link.dto';
import * as bcrypt from 'bcrypt'; // For password hashing
import { v4 as uuidv4 } from 'uuid'; // To generate secure link tokens
import { File } from '../files/entities/file.entity/file.entity'; // Import File entity
import { User } from '../users/entities/user.entity/user.entity'; // Import User entity
@Injectable()
export class SharedLinksService {
  constructor(
    @InjectRepository(SharedLink)
    private sharedLinksRepository: Repository<SharedLink>,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createSharedLinkDto: CreateSharedLinkDto,
    userId: string,
  ): Promise<SharedLink> {
    const file = await this.fileRepository.findOne({
      where: { id: createSharedLinkDto.fileId },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, expiresAt } = createSharedLinkDto;

    const linkToken = uuidv4(); // Generate a secure, unique token for the link

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const body = {
      password: hashedPassword,
      file,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      generatedBy: user, // Link to the user who generated it
      linkToken,
    };
    const sharedLink = this.sharedLinksRepository.create(body);

    return this.sharedLinksRepository.save(sharedLink);
  }

  async validateLink(token: string, password?: string): Promise<SharedLink> {
    const sharedLink = await this.sharedLinksRepository.findOne({
      where: { linkToken: token, isActive: true },
      relations: ['file'],
    });

    if (!sharedLink) {
      throw new NotFoundException('Link not found or expired.');
    }

    if (sharedLink.expiresAt && sharedLink.expiresAt < new Date()) {
      throw new ForbiddenException('Link has expired.');
    }

    if (sharedLink.password) {
      const isPasswordValid = await bcrypt.compare(
        password,
        sharedLink.password,
      );
      if (!isPasswordValid) {
        throw new ForbiddenException('Invalid password.');
      }
    }

    return sharedLink;
  }

  async deactivateLink(linkId: string): Promise<void> {
    const sharedLink = await this.sharedLinksRepository.findOne({
      where: { id: linkId },
    });
    if (!sharedLink) {
      throw new NotFoundException('Shared link not found.');
    }
    sharedLink.isActive = false;
    await this.sharedLinksRepository.save(sharedLink);
  }
}

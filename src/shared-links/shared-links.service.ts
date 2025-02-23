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
import { File } from '../files/entities/file.entity/file.entity'; // Import File entity
import { User } from '../users/entities/user.entity/user.entity'; // Import User entity
import * as CryptoJS from 'crypto-js';

@Injectable()
export class SharedLinksService {
  constructor(
    @InjectRepository(SharedLink)
    private sharedLinksRepository: Repository<SharedLink>,
    @InjectRepository(File) private fileRepository: Repository<File>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(
    createSharedLinkDto: CreateSharedLinkDto,
    userId: string,
  ): Promise<SharedLink> {
    const { fileId, password, expiresAt } = createSharedLinkDto;
    const file = await this.fileRepository.findOne({ where: { id: fileId } });
    if (!file) throw new NotFoundException('File not found');

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Generate a secure token
    const linkToken = CryptoJS.lib.WordArray.random(16).toString();

    const sharedLink = new SharedLink();
    sharedLink.linkToken = linkToken;
    sharedLink.password = password ? await bcrypt.hash(password, 10) : null;
    sharedLink.expiresAt = expiresAt;
    sharedLink.file = file;
    sharedLink.generatedBy = user;

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
      sharedLink.isActive = false;
      await this.sharedLinksRepository.save(sharedLink);
      throw new NotFoundException('Link has expired.');
    }

    if (sharedLink.password && !password) {
      throw new ForbiddenException('Enter password!');
    }

    if (sharedLink.password && password) {
      const isPasswordValid = await bcrypt.compare(
        password,
        sharedLink.password,
      );
      if (!isPasswordValid) {
        throw new ForbiddenException('Invalid password.');
      }
    }

    // Increment the download count
    sharedLink.downloads += 1;
    await this.sharedLinksRepository.save(sharedLink);

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

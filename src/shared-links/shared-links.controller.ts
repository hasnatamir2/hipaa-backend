// src/shared-links/shared-links.controller.ts

import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SharedLinksService } from './shared-links.service';
import { CreateSharedLinkDto } from './dto/create-shared-link.dto/create-shared-link.dto';
// import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@Controller('shared-links')
export class SharedLinksController {
  constructor(private readonly sharedLinksService: SharedLinksService) {}

  @UseGuards(JwtAuthGuard) // Secure the API
  @Post('create')
  create(@Body() createSharedLinkDto: CreateSharedLinkDto, @Req() req: any) {
    const userId = req?.user.id; // Extract user from the request (added by JwtAuthGuard)
    return this.sharedLinksService.create(createSharedLinkDto, userId);
  }

  @Get(':token')
  async access(
    @Param('token') token: string,
    @Body('password') password?: string,
  ) {
    return this.sharedLinksService.validateLink(token, password);
  }

  @Delete(':id')
  async revoke(@Param('id') linkId: string) {
    await this.sharedLinksService.deactivateLink(linkId);
    return { message: 'Link revoked successfully' };
  }
}

import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto/create-folder.dto';

@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  async create(@Body() createFolderDto: CreateFolderDto): Promise<string> {
    return this.foldersService.createFolder(createFolderDto);
  }

  @Get(':folderName/files')
  async getFiles(@Param('folderName') folderName: string) {
    return this.foldersService.getFilesInFolder(folderName);
  }
}

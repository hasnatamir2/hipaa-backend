import { Controller, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto/update-folder.dto';

@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  create(@Body() createFolderDto: CreateFolderDto) {
    return this.foldersService.create(createFolderDto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateFolderDto: UpdateFolderDto) {
    return this.foldersService.update(id, updateFolderDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.foldersService.delete(id);
  }

  @Post(':folderId/assign-file/:fileId')
  assignFileToFolder(
    @Param('folderId') folderId: number,
    @Param('fileId') fileId: number,
  ) {
    return this.foldersService.assignFileToFolder(folderId, fileId);
  }
}

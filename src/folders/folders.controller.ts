import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto/update-folder.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  create(@Body() createFolderDto: CreateFolderDto) {
    return this.foldersService.create(createFolderDto);
  }

  // get files in folder based on permission level
  @UseGuards(JwtAuthGuard) // Secure the API
  @Get(':folderId/files')
  getFilesInFolder(@Param('folderId') folderId: string, @Req() req: any) {
    const user = req?.user;
    return this.foldersService.getFilesInFolder(folderId, user);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateFolderDto: UpdateFolderDto) {
    return this.foldersService.update(id, updateFolderDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.foldersService.delete(id);
  }

  @Post(':folderId/assign-file/:fileId')
  assignFileToFolder(
    @Param('folderId') folderId: string,
    @Param('fileId') fileId: string,
  ) {
    return this.foldersService.assignFileToFolder(folderId, fileId);
  }
}

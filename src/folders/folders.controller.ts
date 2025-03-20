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
import { Folder } from './entities/folder.entity/folder.entity';
import { User } from 'src/users/entities/user.entity/user.entity';

@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createFolderDto: CreateFolderDto, @Req() req: any) {
    const user = req?.user as User;
    return this.foldersService.create(createFolderDto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getFolders(@Req() req: any): Promise<Folder[]> {
    try {
      const user = req.user as User; // get the user from request (from JWT)
      return await this.foldersService.getFoldersByUserId(user);
    } catch (error: any) {
      throw new Error(`Failed to get files ERROR: ${error.message}`);
    }
  }

  @Get('/all')
  @UseGuards(JwtAuthGuard)
  async getAllFodlers(): Promise<Folder[]> {
    return this.foldersService.getAll();
  }

  @Get('/folders-with-files')
  @UseGuards(JwtAuthGuard)
  async getFoldersWithFiles(@Req() req: any): Promise<Folder[]> {
    try {
      const user = req.user as User; // get the user from request (from JWT)
      return await this.foldersService.getFoldersWithFilesByUserId(user);
    } catch (error: any) {
      throw new Error(`Failed to get files ERROR: ${error.message}`);
    }
  }

  // get files in folder based on permission level
  @UseGuards(JwtAuthGuard) // Secure the API
  @Get(':folderId/files')
  getFilesInFolder(@Param('folderId') folderId: string, @Req() req: any) {
    const user = req?.user as User;
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

  // Fetch folders accessible by the current user's groups.
  @UseGuards(JwtAuthGuard)
  @Get('accessible')
  async findAccessibleFolders(@Req() req: any): Promise<Folder[]> {
    const userId = req.user.id;
    return await this.foldersService.findAccessibleFolders(userId);
  }

  // Fetch folders accessible by the current user's groups.
  @UseGuards(JwtAuthGuard)
  @Get('folders-tree')
  async getFoldersTree(@Req() req: any): Promise<Folder[]> {
    const userId = req.user.id;
    return await this.foldersService.getFoldersTree(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':folderId/assign-parent-folder/:parentFolderId')
  async assignParentFolder(
    @Param('folderId') folderId: string,
    @Param('parentFolderId') parentFolderId: string,
    @Req() req: any,
  ): Promise<Folder> {
    const userId = req.user.id;
    return await this.foldersService.assignParentFolder(
      folderId,
      parentFolderId,
      userId,
    );
  }
}

import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Body,
  Res,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileDto } from './dto/upload-file.dto/upload-file.dto';
import { Response } from 'express';
import { File } from './entities/file.entity/file.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Body() uploadFileDto: UploadFileDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const user = req.user; // get the user from request (from JWT)
    return this.filesService.uploadFile(uploadFileDto, file.buffer, user);
  }

  @Get('download/:fileKey')
  async downloadFile(@Param('fileKey') fileKey: string, @Res() res: Response) {
    // const fileBuffer = await this.filesService.downloadFile(fileKey);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileKey}"`,
    });

    const fileStream = await this.filesService.downloadFile(fileKey);

    fileStream.pipe(res);
  }

  @Get()
  async getFiles(
    @Query('folderId') folderId: string,
    @Req() req: any,
  ): Promise<File[]> {
    try {
      const user = req.user; // get the user from request (from JWT)
      return await this.filesService.getFiles(folderId, user);
    } catch (error: any) {
      throw new Error(`Failed to get files ERROR: ${error.message}`);
    }
  }

  @Get(':id')
  async getFileDetails(
    @Param('id') fileId: string,
    @Req() req: any,
  ): Promise<File> {
    const user = req.user; // get the user from request (from JWT)
    return await this.filesService.getFileDetails(fileId, user);
  }
}

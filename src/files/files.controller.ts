import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto/create-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Body() createFileDto: CreateFileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.filesService.uploadFile(createFileDto, file);
  }

  @Get(':fileKey')
  async download(@Param('fileKey') fileKey: string) {
    return this.filesService.downloadFile(fileKey);
  }

  @Delete(':fileKey')
  async delete(@Param('fileKey') fileKey: string) {
    return this.filesService.deleteFile(fileKey);
  }
}

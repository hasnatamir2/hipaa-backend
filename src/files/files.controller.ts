import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Body,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileDto } from './dto/upload-file.dto/upload-file.dto';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Body() uploadFileDto: UploadFileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.filesService.uploadFile(uploadFileDto, file.buffer);
  }

  @Get('download/:fileKey')
  async downloadFile(@Param('fileKey') fileKey: string) {
    const decryptedFileBuffer = await this.filesService.downloadFile(fileKey);
    return decryptedFileBuffer;
  }
}

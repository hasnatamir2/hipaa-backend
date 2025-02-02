import { Injectable, Logger } from '@nestjs/common';
import { CreateFolderDto } from './dto/create-folder.dto/create-folder.dto';
import { FilesService } from '../files/files.service';

@Injectable()
export class FoldersService {
  private readonly logger = new Logger(FoldersService.name);

  constructor(private readonly filesService: FilesService) {}

  // Create a folder (in terms of a prefix in S3)
  async createFolder(createFolderDto: CreateFolderDto): Promise<string> {
    const { folderName } = createFolderDto;

    // Simulate folder creation by handling folder names as prefixes
    this.logger.log(`Folder created: ${folderName}`);

    return `Folder ${folderName} created successfully`;
  }

  // Get all files within a folder
  async getFilesInFolder(folderName: string): Promise<File[]> {
    return await this.filesService.getFilesInFolder(folderName);
  }
}

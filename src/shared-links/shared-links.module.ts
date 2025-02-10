import { Module } from '@nestjs/common';
import { SharedLinksController } from './shared-links.controller';
import { SharedLinksService } from './shared-links.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedLink } from './entities/shared-link.entity/shared-link.entity';
import { User } from 'src/users/entities/user.entity/user.entity';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SharedLink, User]), // Add SharedLink repository here
    FilesModule,
  ],
  controllers: [SharedLinksController],
  providers: [SharedLinksService],
})
export class SharedLinksModule {}

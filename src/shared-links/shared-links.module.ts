import { Module } from '@nestjs/common';
import { SharedLinksController } from './shared-links.controller';
import { SharedLinksService } from './shared-links.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedLink } from './entities/shared-link.entity/shared-link.entity';
import { User } from 'src/users/entities/user.entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SharedLink, File, User]), // Add SharedLink repository here
  ],
  controllers: [SharedLinksController],
  providers: [SharedLinksService],
})
export class SharedLinksModule {}

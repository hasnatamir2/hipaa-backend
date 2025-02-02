import { Module } from '@nestjs/common';
import { SharedLinksController } from './shared-links.controller';
import { SharedLinksService } from './shared-links.service';

@Module({
  controllers: [SharedLinksController],
  providers: [SharedLinksService]
})
export class SharedLinksModule {}

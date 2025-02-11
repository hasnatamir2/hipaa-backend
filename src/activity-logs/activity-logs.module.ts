import { Module } from '@nestjs/common';
import { ActivityLogsController } from './activity-logs.controller';
import { ActivityLogsService } from './activity-logs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLog } from './entities/activity-log.entity/activity-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityLog]), // Register the User entity
  ],
  controllers: [ActivityLogsController],
  providers: [ActivityLogsService],
})
export class ActivityLogsModule {}

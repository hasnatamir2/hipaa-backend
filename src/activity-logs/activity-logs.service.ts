import { Injectable } from '@nestjs/common';
// import { ActivityLog } from './entities/activity-log.entity/activity-log.entity';

@Injectable()
export class ActivityLogsService {
  async logAction(userId: number, fileId: number, action: string) {
    // Save to DB
  }
}

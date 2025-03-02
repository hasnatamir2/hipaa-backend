// activity-log.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity/activity-log.entity';
import { ActivityLogType } from 'src/common/constants/activity-logs/activity-logs';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
  ) {}

  // Log a new activity
  async logAction(
    userId: string,
    action: ActivityLogType,
    targetId?: string,
    targetType?: string,
  ): Promise<ActivityLog> {
    const log = this.activityLogRepository.create({
      action,
      user: { id: userId }, // Assuming user is loaded as relation
      targetId,
      targetType,
      timestamp: new Date(),
    });
    return this.activityLogRepository.save(log);
  }

  // Get activity logs for a user
  async getLogsByUser(
    userId: string,
    // offset: number,
    // size: number,
  ): Promise<{ result: ActivityLog[]; total: number }> {
    // const take = Number(size) || 10;
    // const skip = Number(offset) || 0;
    const [result, total] = await this.activityLogRepository.findAndCount({
      where: { user: { id: userId } },
      order: { timestamp: 'DESC' },
      // take,
      // skip,
    });
    return {
      result,
      total,
    };
  }

  // Get activity logs for a file or folder
  async getLogsByTarget(
    targetId: string,
    targetType: string,
  ): Promise<ActivityLog[]> {
    return this.activityLogRepository.find({
      where: { targetId, targetType },
      order: { timestamp: 'DESC' },
    });
  }
}

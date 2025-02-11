// activity-log.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { Roles } from 'src/common/decorators/roles/roles';
import { UserRole } from 'src/common/constants/roles/roles.enum';

@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get('user/:userId')
  @Roles(UserRole.ADMIN)
  getLogsByUser(@Param('userId') userId: string) {
    return this.activityLogsService.getLogsByUser(userId);
  }

  @Get('target')
  getLogsByTarget(
    @Query('targetId') targetId: string,
    @Query('targetType') targetType: string,
  ) {
    return this.activityLogsService.getLogsByTarget(targetId, targetType);
  }
}

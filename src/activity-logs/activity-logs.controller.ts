import { Controller, Get, Req, Query, UseGuards } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  @UseGuards(JwtAuthGuard) // Secure the API
  getLogsByUser(
    @Req() req: any,
    // @Query('offset') offset: number,
    // @Query('size') size: number,
  ) {
    const userId = req?.user.id;
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

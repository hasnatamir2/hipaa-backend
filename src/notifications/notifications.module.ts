// notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { EmailStrategy } from './strategies/email.strategy';
import { SmsStrategy } from './strategies/sms.strategy';
import { PushStrategy } from './strategies/push.strategy';

@Module({
  providers: [NotificationService, EmailStrategy, SmsStrategy, PushStrategy],
  exports: [NotificationService],
})
export class NotificationsModule {}

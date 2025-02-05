// notifications/notifications.service.ts
import { Injectable } from '@nestjs/common';
import { EmailStrategy } from './strategies/email.strategy';
import { SmsStrategy } from './strategies/sms.strategy';
import { PushStrategy } from './strategies/push.strategy';
import { NotificationsDto } from './dto/notifications.dto/notifications.dto';
import { NOTIFICATIONS_TYPE } from 'src/common/constants/notifications/notifications-type.enum';

@Injectable()
export class NotificationService {
  constructor(
    private readonly emailStrategy: EmailStrategy,
    private readonly smsStrategy: SmsStrategy,
    private readonly pushStrategy: PushStrategy,
  ) {}

  sendNotification(notificationsDto: NotificationsDto): void {
    const { type, recipient, message } = notificationsDto;

    switch (type) {
      case NOTIFICATIONS_TYPE.EMAIL:
        this.emailStrategy.send(recipient, message);
        break;
      case NOTIFICATIONS_TYPE.SMS:
        this.smsStrategy.send(recipient, message);
        break;
      case NOTIFICATIONS_TYPE.PUSH:
        this.pushStrategy.send(recipient, message);
        break;
      default:
        throw new Error('Invalid notification type');
    }
  }
}

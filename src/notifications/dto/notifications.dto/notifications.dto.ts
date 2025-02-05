import { NOTIFICATIONS_TYPE } from 'src/common/constants/notifications/notifications-type.enum';

// notifications/dto/notification.dto.ts
export class NotificationsDto {
  type: NOTIFICATIONS_TYPE;
  recipient: string;
  message: string;
}

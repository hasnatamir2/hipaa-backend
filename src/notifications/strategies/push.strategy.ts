// notifications/strategies/push.strategy.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class PushStrategy {
  send(deviceToken: string, message: string): void {
    // Logic for sending push notifications (e.g., using Firebase, etc.)
    console.log(`Sending push notification to ${deviceToken}: ${message}`);
  }
}

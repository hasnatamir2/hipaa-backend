// notifications/strategies/sms.strategy.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsStrategy {
  send(phoneNumber: string, message: string): void {
    // Logic for sending SMS (e.g., using Twilio, AWS SNS, etc.)
    console.log(`Sending SMS to ${phoneNumber}: ${message}`);
  }
}

// notifications/strategies/email.strategy.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailStrategy {
  send(email: string, message: string): void {
    // Logic for sending email (e.g., using SendGrid, SES, etc.)
    console.log(`Sending email to ${email}: ${message}`);
  }
}

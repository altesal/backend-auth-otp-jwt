import { OtpSender } from '../../application/ports/OtpSender';
import { Email } from '../../domain/value-objects/Email';
import { Otp } from '../../domain/value-objects/Otp';

export class ConsoleOtpSender implements OtpSender {
  async send(email: Email, otp: Otp): Promise<void> {
    console.log(`\n🔐 OTP for ${email.value}: ${otp.value}\n`);
  }
}


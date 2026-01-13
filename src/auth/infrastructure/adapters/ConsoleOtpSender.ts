import { OtpSender } from '../../application/ports/OtpSender';
import { Email } from '../../domain/value-objects/Email';
import { Otp } from '../../domain/value-objects/Otp';
import { Logger } from '../../../shared/application/ports/Logger';

export class ConsoleOtpSender implements OtpSender {
  constructor(private logger: Logger) {}

  async send(email: Email, otp: Otp): Promise<void> {
    this.logger.info(`OTP for ${email.value}: ${otp.value}`);
  }
}


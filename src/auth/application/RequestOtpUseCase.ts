import { UserRepository } from '../domain/repositories/UserRepository';
import { OtpSessionRepository } from '../domain/repositories/OtpSessionRepository';
import { OtpSession } from '../domain/entities/OtpSession';
import { Email } from '../domain/value-objects/Email';
import { Otp } from '../domain/value-objects/Otp';
import { DomainError } from '../../shared/domain/DomainError';
import { OtpSender } from './ports/OtpSender';

export class RequestOtpUseCase {
  constructor(
    private userRepository: UserRepository,
    private otpSessionRepository: OtpSessionRepository,
    private otpSender: OtpSender
  ) {}

  async execute(emailValue: string): Promise<void> {
    const email = Email.create(emailValue);
    const user = await this.userRepository.findByEmail(email);
    if (user.isNone()) {
      throw DomainError.createNotFound('User not found');
    }
    const existingSession = await this.otpSessionRepository.findByEmail(email);
    if (existingSession.isSome() && existingSession.getOrThrow().isBlocked()) {
      throw DomainError.createValidation('Account temporarily blocked');
    }
    const otp = Otp.generate();
    const session = OtpSession.create(email, otp);
    await this.otpSessionRepository.save(session);
    await this.otpSender.send(email, otp);
  }
}

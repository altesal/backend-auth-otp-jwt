import { OtpSessionRepository } from '../domain/repositories/OtpSessionRepository';
import { OtpSession } from '../domain/entities/OtpSession';
import { TokenGenerator } from './ports/TokenGenerator';
import { Email } from '../domain/value-objects/Email';
import { Otp } from '../domain/value-objects/Otp';
import { DomainError } from '../../shared/domain/DomainError';

export interface TokenDto {
  token: string;
}

export class VerifyOtpUseCase {
  constructor(
    private otpSessionRepository: OtpSessionRepository,
    private tokenGenerator: TokenGenerator
  ) {}

  async execute(emailValue: string, otpValue: string): Promise<TokenDto> {
    const email = Email.create(emailValue);
    const otpToVerify = Otp.create(otpValue);
    const session = await this.findActiveSession(email);
    await this.validateOtp(session, otpToVerify);
    return this.completeVerification(email);
  }

  private async findActiveSession(email: Email): Promise<OtpSession> {
    const maybeSession = await this.otpSessionRepository.findByEmail(email);
    if (maybeSession.isNone()) {
      throw DomainError.createNotFound('No OTP session found');
    }
    const session = maybeSession.getOrThrow();
    if (session.isExpired()) {
      throw DomainError.createValidation('OTP has expired');
    }
    return session;
  }

  private async validateOtp(session: OtpSession, otpToVerify: Otp): Promise<void> {
    if (session.verifyOtp(otpToVerify)) {
      return;
    }
    await this.handleFailedAttempt(session);
  }

  private async handleFailedAttempt(session: OtpSession): Promise<never> {
    session.incrementAttempts();
    if (session.hasReachedMaxAttempts()) {
      session.block();
      await this.otpSessionRepository.save(session);
      throw DomainError.createValidation('Account blocked');
    }
    await this.otpSessionRepository.save(session);
    throw DomainError.createValidation('Invalid OTP');
  }

  private async completeVerification(email: Email): Promise<TokenDto> {
    await this.otpSessionRepository.deleteByEmail(email);
    const token = this.tokenGenerator.generate(email);
    return { token };
  }
}

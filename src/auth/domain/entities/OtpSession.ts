import { Id } from '../../../shared/domain/value-objects/Id';
import { Email } from '../value-objects/Email';
import { Otp } from '../value-objects/Otp';

export class OtpSession {
  private static readonly millisecondsPerMinute = 60 * 1000;
  private static readonly expirationMinutes = 5;
  private static readonly blockDurationMinutes = 10;
  private static readonly maxAttempts = 3;

  private constructor(
    readonly id: Id,
    readonly email: Email,
    private readonly otp: Otp,
    private attempts: number,
    private readonly expiresAt: Date,
    private blockedUntil: Date | null
  ) {}

  static create(email: Email, otp: Otp): OtpSession {
    const expirationMs = this.expirationMinutes * this.millisecondsPerMinute;
    const expiresAt = new Date(Date.now() + expirationMs);
    return new OtpSession(Id.generate(), email, otp, 0, expiresAt, null);
  }

  static reconstitute(
    id: Id,
    email: Email,
    otp: Otp,
    attempts: number,
    expiresAt: Date,
    blockedUntil: Date | null
  ): OtpSession {
    return new OtpSession(id, email, otp, attempts, expiresAt, blockedUntil);
  }

  getAttempts(): number {
    return this.attempts;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  verifyOtp(otpToVerify: Otp): boolean {
    return this.otp.equals(otpToVerify);
  }

  incrementAttempts(): void {
    this.attempts++;
  }

  hasReachedMaxAttempts(): boolean {
    return this.attempts >= OtpSession.maxAttempts;
  }

  isBlocked(): boolean {
    if (!this.blockedUntil) {
      return false;
    }
    return new Date() < this.blockedUntil;
  }

  block(): void {
    const blockDurationMs = OtpSession.blockDurationMinutes * OtpSession.millisecondsPerMinute;
    this.blockedUntil = new Date(Date.now() + blockDurationMs);
  }

  toPrimitives() {
    return {
      id: this.id.value,
      email: this.email.value,
      otp: this.otp.value,
      attempts: this.attempts,
      expiresAt: this.expiresAt.toISOString(),
      blockedUntil: this.blockedUntil?.toISOString() ?? null,
    };
  }
}

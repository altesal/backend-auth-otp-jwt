import { DomainError } from '../../../shared/domain/DomainError';

export class Otp {
  private static readonly otpRegex = /^\d{6}$/;

  private constructor(readonly value: string) {}

  static generate(): Otp {
    const minSixDigitNumber = 100000;
    const maxSixDigitNumber = 999999;
    const range = maxSixDigitNumber - minSixDigitNumber + 1;
    const code = Math.floor(minSixDigitNumber + Math.random() * range).toString();
    return new Otp(code);
  }

  static create(value: string): Otp {
    if (!this.otpRegex.test(value)) {
      throw DomainError.createValidation('OTP must be 6 digits');
    }
    return new Otp(value);
  }

  equals(other: Otp): boolean {
    return this.value === other.value;
  }
}

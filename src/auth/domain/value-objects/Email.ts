import { DomainError } from '../../../shared/domain/DomainError';

export class Email {
  private static readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(readonly value: string) {}

  static create(value: string): Email {
    if (!this.emailRegex.test(value)) {
      throw DomainError.createValidation('Invalid email format');
    }
    return new Email(value);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

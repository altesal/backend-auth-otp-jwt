import { DomainError } from '../../../shared/domain/DomainError';

export class Phone {
  private static readonly internationalFormat = /^\+\d{7,15}$/;

  private constructor(readonly value: string) {}

  static create(value: string): Phone {
    if (value !== '' && !this.internationalFormat.test(value)) {
      throw DomainError.createValidation('Invalid phone format');
    }
    return new Phone(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}

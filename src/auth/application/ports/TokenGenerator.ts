import { Email } from '../../domain/value-objects/Email';

export interface TokenGenerator {
  generate(email: Email): string;
}


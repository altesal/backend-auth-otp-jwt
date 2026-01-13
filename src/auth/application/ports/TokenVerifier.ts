import { Email } from '../../domain/value-objects/Email';

export interface TokenVerifier {
  verify(token: string): Email;
}


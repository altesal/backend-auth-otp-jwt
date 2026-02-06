import { Id } from '../../../shared/domain/value-objects/Id';

export interface TokenVerifier {
  verify(token: string): Id;
}


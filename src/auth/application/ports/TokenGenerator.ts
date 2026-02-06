import { Id } from '../../../shared/domain/value-objects/Id';

export interface TokenGenerator {
  generate(userId: Id): string;
}


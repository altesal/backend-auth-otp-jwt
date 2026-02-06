import jwt from 'jsonwebtoken';
import { TokenGenerator } from '../../application/ports/TokenGenerator';
import { TokenVerifier } from '../../application/ports/TokenVerifier';
import { Id } from '../../../shared/domain/value-objects/Id';
import { DomainError } from '../../../shared/domain/DomainError';

export class JsonWebTokenService implements TokenGenerator, TokenVerifier {
  private static readonly hoursPerDay = 24;
  private static readonly minutesPerHour = 60;
  private static readonly secondsPerMinute = 60;
  private static readonly defaultExpiresInSeconds =
    JsonWebTokenService.hoursPerDay * JsonWebTokenService.minutesPerHour * JsonWebTokenService.secondsPerMinute;
  private readonly secret: string;
  private readonly expiresInSeconds: number;

  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    this.secret = secret;
    this.expiresInSeconds =
      parseInt(process.env.JWT_EXPIRATION_SECONDS || '', 10) || JsonWebTokenService.defaultExpiresInSeconds;
  }

  generate(userId: Id): string {
    return jwt.sign({ userId: userId.value }, this.secret, {
      expiresIn: this.expiresInSeconds,
      algorithm: 'HS256',
    });
  }

  verify(token: string): Id {
    try {
      const payload = jwt.verify(token, this.secret, {
        algorithms: ['HS256'],
      }) as { userId: string };
      return Id.create(payload.userId);
    } catch {
      throw DomainError.createValidation('Invalid token');
    }
  }
}

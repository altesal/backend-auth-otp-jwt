import { Request, Response, NextFunction } from 'express';
import { TokenVerifier } from '../../application/ports/TokenVerifier';
import { Maybe } from '../../../shared/domain/Maybe';

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export function createAuthMiddleware(
  tokenVerifier: TokenVerifier
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header required' });
      return;
    }
    const maybeToken = extractBearerToken(authHeader);
    if (maybeToken.isNone()) {
      res.status(401).json({ error: 'Invalid token format' });
      return;
    }
    const token = maybeToken.getOrThrow();
    try {
      const userId = tokenVerifier.verify(token);
      (req as AuthenticatedRequest).userId = userId.value;
      next();
    } catch {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
}

function extractBearerToken(authHeader: string): Maybe<string> {
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return Maybe.none();
  }
  return Maybe.some(parts[1]);
}

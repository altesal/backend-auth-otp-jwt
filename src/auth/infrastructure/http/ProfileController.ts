import { Response } from 'express';
import { GetCurrentUserUseCase } from '../../application/GetCurrentUserUseCase';
import { UpdateProfileUseCase } from '../../application/UpdateProfileUseCase';
import { Logger } from '../../../shared/application/ports/Logger';
import { DomainError } from '../../../shared/domain/DomainError';
import { AuthenticatedRequest } from './AuthMiddleware';

export class ProfileController {
  constructor(
    private getCurrentUserUseCase: GetCurrentUserUseCase,
    private updateProfileUseCase: UpdateProfileUseCase,
    private logger: Logger
  ) {}

  async me(request: AuthenticatedRequest, response: Response): Promise<void> {
    try {
      const result = await this.getCurrentUserUseCase.execute(request.userId);
      response.status(200).json(result);
    } catch (error) {
      this.handleError(error, response);
    }
  }

  async updateMe(request: AuthenticatedRequest, response: Response): Promise<void> {
    try {
      const { fullName, phone } = request.body;
      if (fullName === undefined || phone === undefined) {
        response.status(400).json({ error: 'fullName and phone are required' });
        return;
      }
      const result = await this.updateProfileUseCase.execute(request.userId, fullName, phone);
      response.status(200).json(result);
    } catch (error) {
      this.handleError(error, response);
    }
  }

  private handleError(error: unknown, response: Response): void {
    if (error instanceof DomainError) {
      const statusMap: Record<string, number> = {
        notFound: 404,
        validation: 422,
      };
      const status = statusMap[error.type] || 400;
      response.status(status).json({ error: error.message });
      return;
    }
    this.logger.error(error, 'Profile operation failed');
    response.status(500).json({ error: 'Internal server error' });
  }
}

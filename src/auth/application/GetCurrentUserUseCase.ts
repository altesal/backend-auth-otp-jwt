import { UserRepository } from '../domain/repositories/UserRepository';
import { Id } from '../../shared/domain/value-objects/Id';
import { DomainError } from '../../shared/domain/DomainError';

export interface UserDTO {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  createdAt: string;
}

export class GetCurrentUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string): Promise<UserDTO> {
    const id = Id.create(userId);
    const maybeUser = await this.userRepository.findById(id);
    if (maybeUser.isNone()) {
      throw DomainError.createNotFound('User not found');
    }
    const user = maybeUser.getOrThrow();
    return user.toPrimitives();
  }
}

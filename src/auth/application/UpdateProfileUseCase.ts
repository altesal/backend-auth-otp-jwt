import { UserRepository } from '../domain/repositories/UserRepository';
import { Phone } from '../domain/value-objects/Phone';
import { Id } from '../../shared/domain/value-objects/Id';
import { DomainError } from '../../shared/domain/DomainError';
import { UserDTO } from './GetCurrentUserUseCase';

export class UpdateProfileUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string, fullName: string, phone: string): Promise<UserDTO> {
    this.validateFullName(fullName);
    const phoneVO = Phone.create(phone);
    const id = Id.create(userId);
    const maybeUser = await this.userRepository.findById(id);
    if (maybeUser.isNone()) {
      throw DomainError.createNotFound('User not found');
    }
    const user = maybeUser.getOrThrow();
    user.updateProfile(fullName, phoneVO);
    await this.userRepository.save(user);
    return user.toPrimitives();
  }

  private validateFullName(fullName: string): void {
    if (!fullName || fullName.trim() === '') {
      throw DomainError.createValidation('Full name cannot be empty');
    }
  }
}

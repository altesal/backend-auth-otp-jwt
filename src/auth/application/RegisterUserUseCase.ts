import { UserRepository } from '../domain/repositories/UserRepository';
import { User } from '../domain/entities/User';
import { Email } from '../domain/value-objects/Email';
import { DomainError } from '../../shared/domain/DomainError';

export interface UserDto {
  id: string;
  email: string;
  createdAt: string;
}

export class RegisterUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(emailValue: string): Promise<UserDto> {
    const email = Email.create(emailValue);
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser.isSome()) {
      throw DomainError.createValidation('Email already registered');
    }
    const user = User.create(email);
    await this.userRepository.save(user);
    return this.toDto(user);
  }

  private toDto(user: User): UserDto {
    const primitives = user.toPrimitives();
    return {
      id: primitives.id,
      email: primitives.email,
      createdAt: primitives.createdAt,
    };
  }
}

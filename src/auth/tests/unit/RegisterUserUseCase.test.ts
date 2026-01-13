import { RegisterUserUseCase } from '../../application/RegisterUserUseCase';
import { InMemoryUserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';

describe('The User Registration', () => {
  it('registers a new user with valid email', async () => {
    const userRepository = new InMemoryUserRepository();
    const useCase = new RegisterUserUseCase(userRepository);

    const result = await useCase.execute('user@domain.com');

    expect(result.id).toBeDefined();
    expect(result.email).toBe('user@domain.com');
  });

  it('does not allow duplicate email registration', async () => {
    const existingUser = User.create(Email.create('user@domain.com'));
    const userRepository = new InMemoryUserRepository([existingUser]);
    const useCase = new RegisterUserUseCase(userRepository);

    await expect(useCase.execute('user@domain.com')).rejects.toThrow('Email already registered');
  });

  it('does not allow invalid email format', async () => {
    const userRepository = new InMemoryUserRepository();
    const useCase = new RegisterUserUseCase(userRepository);

    await expect(useCase.execute('invalid-email')).rejects.toThrow('Invalid email format');
  });
});

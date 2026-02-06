import { GetCurrentUserUseCase } from '../../application/GetCurrentUserUseCase';
import { InMemoryUserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { Phone } from '../../domain/value-objects/Phone';

describe('The Profile Retrieval', () => {
  it('provides complete user profile for authenticated user', async () => {
    const user = User.create(Email.create('user@domain.com'));
    user.updateProfile('John Doe', Phone.create('+34612345678'));
    const userRepository = new InMemoryUserRepository([user]);
    const useCase = new GetCurrentUserUseCase(userRepository);

    const profile = await useCase.execute(user.id.value);

    expect(profile.id).toBe(user.id.value);
    expect(profile.email).toBe('user@domain.com');
    expect(profile.fullName).toBe('John Doe');
    expect(profile.phone).toBe('+34612345678');
  });

  it('rejects retrieval for non-existent user', async () => {
    const userRepository = new InMemoryUserRepository();
    const useCase = new GetCurrentUserUseCase(userRepository);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow('User not found');
  });
});

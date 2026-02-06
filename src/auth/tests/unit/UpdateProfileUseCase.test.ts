import { UpdateProfileUseCase } from '../../application/UpdateProfileUseCase';
import { InMemoryUserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';

describe('The Profile Update', () => {
  it('persists fullName and phone changes', async () => {
    const user = User.create(Email.create('user@domain.com'));
    const userRepository = new InMemoryUserRepository([user]);
    const useCase = new UpdateProfileUseCase(userRepository);

    const updatedProfile = await useCase.execute(user.id.value, 'John Doe', '+34612345678');

    expect(updatedProfile.fullName).toBe('John Doe');
    expect(updatedProfile.phone).toBe('+34612345678');
    const savedUser = await userRepository.findById(user.id);
    expect(savedUser.getOrThrow().fullName()).toBe('John Doe');
  });

  it('rejects update for non-existent user', async () => {
    const userRepository = new InMemoryUserRepository();
    const useCase = new UpdateProfileUseCase(userRepository);

    await expect(useCase.execute('non-existent-id', 'John', '+34612345678')).rejects.toThrow('User not found');
  });

  it('does not allow empty fullName', async () => {
    const user = User.create(Email.create('user@domain.com'));
    const userRepository = new InMemoryUserRepository([user]);
    const useCase = new UpdateProfileUseCase(userRepository);

    await expect(useCase.execute(user.id.value, '', '+34612345678')).rejects.toThrow('Full name cannot be empty');
  });

  it('does not allow invalid phone format', async () => {
    const user = User.create(Email.create('user@domain.com'));
    const userRepository = new InMemoryUserRepository([user]);
    const useCase = new UpdateProfileUseCase(userRepository);

    await expect(useCase.execute(user.id.value, 'John Doe', 'invalid-phone')).rejects.toThrow('Invalid phone format');
  });
});

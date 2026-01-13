import { RequestOtpUseCase } from '../../application/RequestOtpUseCase';
import { InMemoryUserRepository } from '../../domain/repositories/UserRepository';
import { InMemoryOtpSessionRepository } from '../../domain/repositories/OtpSessionRepository';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { OtpSession } from '../../domain/entities/OtpSession';
import { Otp } from '../../domain/value-objects/Otp';
import { Id } from '../../../shared/domain/value-objects/Id';
import { OtpSender } from '../../application/ports/OtpSender';

describe('The OTP Request', () => {
  const email = Email.create('user@domain.com');
  const user = User.create(email);

  const createSpyOtpSender = (): OtpSender => ({
    send: jest.fn(),
  });

  it('generates OTP for registered user', async () => {
    const userRepository = new InMemoryUserRepository([user]);
    const otpSessionRepository = new InMemoryOtpSessionRepository();
    const otpSender = createSpyOtpSender();
    const useCase = new RequestOtpUseCase(userRepository, otpSessionRepository, otpSender);

    await useCase.execute('user@domain.com');

    const session = await otpSessionRepository.findByEmail(email);
    expect(session.isSome()).toBe(true);
  });

  it('does not allow OTP request for unregistered user', async () => {
    const userRepository = new InMemoryUserRepository();
    const otpSessionRepository = new InMemoryOtpSessionRepository();
    const otpSender = createSpyOtpSender();
    const useCase = new RequestOtpUseCase(userRepository, otpSessionRepository, otpSender);

    await expect(useCase.execute('unknown@domain.com')).rejects.toThrow('User not found');
  });

  it('does not allow OTP request when account is blocked', async () => {
    const millisecondsPerMinute = 60 * 1000;
    const maxAttempts = 3;
    const fiveMinutesFromNow = new Date(Date.now() + 5 * millisecondsPerMinute);
    const tenMinutesFromNow = new Date(Date.now() + 10 * millisecondsPerMinute);
    const userRepository = new InMemoryUserRepository([user]);
    const blockedSession = OtpSession.reconstitute(
      Id.generate(),
      email,
      Otp.create('123456'),
      maxAttempts,
      fiveMinutesFromNow,
      tenMinutesFromNow
    );
    const otpSessionRepository = new InMemoryOtpSessionRepository([blockedSession]);
    const otpSender = createSpyOtpSender();
    const useCase = new RequestOtpUseCase(userRepository, otpSessionRepository, otpSender);

    await expect(useCase.execute('user@domain.com')).rejects.toThrow('Account temporarily blocked');
  });

  it('sends OTP through the sender', async () => {
    const userRepository = new InMemoryUserRepository([user]);
    const otpSessionRepository = new InMemoryOtpSessionRepository();
    const otpSender = createSpyOtpSender();
    const useCase = new RequestOtpUseCase(userRepository, otpSessionRepository, otpSender);

    await useCase.execute('user@domain.com');

    expect(otpSender.send).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'user@domain.com' }),
      expect.objectContaining({ value: expect.stringMatching(/^\d{6}$/) })
    );
  });
});

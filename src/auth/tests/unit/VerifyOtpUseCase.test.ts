import { VerifyOtpUseCase } from '../../application/VerifyOtpUseCase';
import { InMemoryOtpSessionRepository } from '../../domain/repositories/OtpSessionRepository';
import { InMemoryUserRepository } from '../../domain/repositories/UserRepository';
import { OtpSession } from '../../domain/entities/OtpSession';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { Otp } from '../../domain/value-objects/Otp';
import { Id } from '../../../shared/domain/value-objects/Id';
import { TokenGenerator } from '../../application/ports/TokenGenerator';

describe('The OTP Verification', () => {
  const email = Email.create('user@domain.com');
  const otp = Otp.create('123456');

  const createStubTokenGenerator = (): TokenGenerator => ({
    generate: jest.fn().mockReturnValue('jwt-token'),
  });

  const createUser = () => User.create(email);

  it('authenticates user with correct OTP and issues JWT', async () => {
    const session = OtpSession.create(email, otp);
    const user = createUser();
    const otpSessionRepository = new InMemoryOtpSessionRepository([session]);
    const userRepository = new InMemoryUserRepository([user]);
    const tokenGenerator = createStubTokenGenerator();
    const useCase = new VerifyOtpUseCase(otpSessionRepository, userRepository, tokenGenerator);

    const result = await useCase.execute('user@domain.com', '123456');

    expect(result.token).toBe('jwt-token');
    expect(tokenGenerator.generate).toHaveBeenCalledWith(user.id);
  });

  it('does not allow verification without active session', async () => {
    const otpSessionRepository = new InMemoryOtpSessionRepository();
    const userRepository = new InMemoryUserRepository();
    const tokenGenerator = createStubTokenGenerator();
    const useCase = new VerifyOtpUseCase(otpSessionRepository, userRepository, tokenGenerator);

    await expect(useCase.execute('user@domain.com', '123456')).rejects.toThrow('No OTP session found');
  });

  it('does not allow verification with expired OTP', async () => {
    const oneMinuteInMs = 60 * 1000;
    const expiredAt = new Date(Date.now() - oneMinuteInMs);
    const zeroAttempts = 0;
    const expiredSession = OtpSession.reconstitute(Id.generate(), email, otp, zeroAttempts, expiredAt, null);
    const otpSessionRepository = new InMemoryOtpSessionRepository([expiredSession]);
    const userRepository = new InMemoryUserRepository();
    const tokenGenerator = createStubTokenGenerator();
    const useCase = new VerifyOtpUseCase(otpSessionRepository, userRepository, tokenGenerator);

    await expect(useCase.execute('user@domain.com', '123456')).rejects.toThrow('OTP has expired');
  });

  it('does not allow verification with incorrect OTP', async () => {
    const session = OtpSession.create(email, otp);
    const otpSessionRepository = new InMemoryOtpSessionRepository([session]);
    const userRepository = new InMemoryUserRepository();
    const tokenGenerator = createStubTokenGenerator();
    const useCase = new VerifyOtpUseCase(otpSessionRepository, userRepository, tokenGenerator);

    await expect(useCase.execute('user@domain.com', '654321')).rejects.toThrow('Invalid OTP');
  });

  it('blocks account after 3 failed verification attempts', async () => {
    const session = OtpSession.create(email, otp);
    session.incrementAttempts();
    session.incrementAttempts();
    const otpSessionRepository = new InMemoryOtpSessionRepository([session]);
    const userRepository = new InMemoryUserRepository();
    const tokenGenerator = createStubTokenGenerator();
    const useCase = new VerifyOtpUseCase(otpSessionRepository, userRepository, tokenGenerator);

    await expect(useCase.execute('user@domain.com', '654321')).rejects.toThrow('Account blocked');

    const updatedSession = await otpSessionRepository.findByEmail(email);
    expect(updatedSession.isSome()).toBe(true);
    expect(updatedSession.getOrThrow().isBlocked()).toBe(true);
  });

  it('clears session after successful authentication', async () => {
    const session = OtpSession.create(email, otp);
    const user = createUser();
    const otpSessionRepository = new InMemoryOtpSessionRepository([session]);
    const userRepository = new InMemoryUserRepository([user]);
    const tokenGenerator = createStubTokenGenerator();
    const useCase = new VerifyOtpUseCase(otpSessionRepository, userRepository, tokenGenerator);

    await useCase.execute('user@domain.com', '123456');

    const deletedSession = await otpSessionRepository.findByEmail(email);
    expect(deletedSession.isNone()).toBe(true);
  });
});

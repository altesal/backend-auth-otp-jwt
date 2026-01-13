import { MongoOtpSessionRepository } from '../../infrastructure/adapters/MongoOtpSessionRepository';
import { OtpSession } from '../../domain/entities/OtpSession';
import { Email } from '../../domain/value-objects/Email';
import { Otp } from '../../domain/value-objects/Otp';
import { createTestMongo } from '../../../shared/tests/mongoTestHelper';

describe('The MongoOtpSessionRepository', () => {
  let mongo: Awaited<ReturnType<typeof createTestMongo>>;
  let repository: MongoOtpSessionRepository;

  const email = Email.create('user@domain.com');
  const otp = Otp.create('123456');

  beforeAll(async () => {
    mongo = await createTestMongo();
    repository = new MongoOtpSessionRepository(mongo.db());
  });

  afterAll(() => mongo.stop());
  beforeEach(() => mongo.clean());

  it('persists and retrieves a session by email', async () => {
    const session = OtpSession.create(email, otp);

    await repository.save(session);
    const retrieved = await repository.findByEmail(email);

    expect(retrieved.isSome()).toBe(true);
    expect(retrieved.getOrThrow().email.equals(email)).toBe(true);
  });

  it('indicates absence when session not found', async () => {
    const retrieved = await repository.findByEmail(Email.create('unknown@domain.com'));

    expect(retrieved.isNone()).toBe(true);
  });

  it('removes a session by email', async () => {
    const session = OtpSession.create(email, otp);
    await repository.save(session);

    await repository.deleteByEmail(email);

    const retrieved = await repository.findByEmail(email);
    expect(retrieved.isNone()).toBe(true);
  });

  it('replaces existing session when saving for same email', async () => {
    const session1 = OtpSession.create(email, otp);
    await repository.save(session1);
    const newOtp = Otp.create('654321');
    const session2 = OtpSession.create(email, newOtp);

    await repository.save(session2);

    const retrieved = await repository.findByEmail(email);
    expect(retrieved.isSome()).toBe(true);
    expect(retrieved.getOrThrow().verifyOtp(newOtp)).toBe(true);
  });

  it('preserves session state including attempts and block status', async () => {
    const session = OtpSession.create(email, otp);
    session.incrementAttempts();
    session.incrementAttempts();
    session.block();

    await repository.save(session);

    const retrieved = await repository.findByEmail(email);
    expect(retrieved.getOrThrow().getAttempts()).toBe(2);
    expect(retrieved.getOrThrow().isBlocked()).toBe(true);
  });
});

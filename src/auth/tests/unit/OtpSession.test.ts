import { OtpSession } from '../../domain/entities/OtpSession';
import { Email } from '../../domain/value-objects/Email';
import { Otp } from '../../domain/value-objects/Otp';
import { Id } from '../../../shared/domain/value-objects/Id';

describe('The OtpSession', () => {
  const millisecondsPerMinute = 60 * 1000;
  const email = Email.create('user@domain.com');
  const otp = Otp.create('123456');

  it('creates with email and OTP', () => {
    const session = OtpSession.create(email, otp);

    expect(session.id).toBeDefined();
    expect(session.email.equals(email)).toBe(true);
  });

  it('starts with zero attempts', () => {
    const session = OtpSession.create(email, otp);

    expect(session.getAttempts()).toBe(0);
  });

  it('is valid when just created', () => {
    const session = OtpSession.create(email, otp);

    expect(session.isExpired()).toBe(false);
  });

  it('expires after 5 minutes', () => {
    const sixMinutesInMs = 6 * millisecondsPerMinute;
    const expiredAt = new Date(Date.now() - sixMinutesInMs);

    const session = OtpSession.reconstitute(Id.generate(), email, otp, 0, expiredAt, null);

    expect(session.isExpired()).toBe(true);
  });

  it('validates correct OTP', () => {
    const session = OtpSession.create(email, otp);

    expect(session.verifyOtp(Otp.create('123456'))).toBe(true);
  });

  it('invalidates incorrect OTP', () => {
    const session = OtpSession.create(email, otp);

    expect(session.verifyOtp(Otp.create('654321'))).toBe(false);
  });

  it('tracks failed attempts', () => {
    const session = OtpSession.create(email, otp);

    session.incrementAttempts();

    expect(session.getAttempts()).toBe(1);
  });

  it('is not blocked initially', () => {
    const session = OtpSession.create(email, otp);

    expect(session.isBlocked()).toBe(false);
  });

  it('blocks for 10 minutes when requested', () => {
    const session = OtpSession.create(email, otp);

    session.block();

    expect(session.isBlocked()).toBe(true);
  });

  it('unblocks after block duration expires', () => {
    const elevenMinutesInMs = 11 * millisecondsPerMinute;
    const expiredBlockTime = new Date(Date.now() - elevenMinutesInMs);
    const oneMinuteFromNow = new Date(Date.now() + millisecondsPerMinute);
    const maxAttempts = 3;

    const session = OtpSession.reconstitute(Id.generate(), email, otp, maxAttempts, oneMinuteFromNow, expiredBlockTime);

    expect(session.isBlocked()).toBe(false);
  });

  it('reaches max attempts after 3 failures', () => {
    const session = OtpSession.create(email, otp);

    session.incrementAttempts();
    session.incrementAttempts();
    session.incrementAttempts();

    expect(session.hasReachedMaxAttempts()).toBe(true);
  });

  it('converts to primitives for persistence', () => {
    const session = OtpSession.create(email, otp);

    const primitives = session.toPrimitives();

    expect(primitives.id).toBe(session.id.value);
    expect(primitives.email).toBe(email.value);
    expect(primitives.otp).toBe(otp.value);
    expect(primitives.attempts).toBe(0);
    expect(primitives.expiresAt).toBeDefined();
    expect(primitives.blockedUntil).toBeNull();
  });

  it('reconstructs from persistence data', () => {
    const id = Id.generate();
    const fiveMinutesFromNow = new Date(Date.now() + 5 * millisecondsPerMinute);
    const twoAttempts = 2;

    const session = OtpSession.reconstitute(id, email, otp, twoAttempts, fiveMinutesFromNow, null);

    expect(session.id.equals(id)).toBe(true);
    expect(session.getAttempts()).toBe(twoAttempts);
  });
});

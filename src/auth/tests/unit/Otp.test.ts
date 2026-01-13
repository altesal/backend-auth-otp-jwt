import { Otp } from '../../domain/value-objects/Otp';

describe('The Otp', () => {
  it('generates a 6 digit numeric code', () => {
    const otp = Otp.generate();

    expect(otp.value).toMatch(/^\d{6}$/);
  });

  it('accepts a valid 6 digit code', () => {
    const otp = Otp.create('123456');

    expect(otp.value).toBe('123456');
  });

  it('does not allow code with less than 6 digits', () => {
    expect(() => Otp.create('12345')).toThrow('OTP must be 6 digits');
  });

  it('does not allow code with more than 6 digits', () => {
    expect(() => Otp.create('1234567')).toThrow('OTP must be 6 digits');
  });

  it('does not allow code with non-numeric characters', () => {
    expect(() => Otp.create('12345a')).toThrow('OTP must be 6 digits');
  });

  it('considers two OTPs with same value as equal', () => {
    const otp1 = Otp.create('123456');
    const otp2 = Otp.create('123456');

    expect(otp1.equals(otp2)).toBe(true);
  });

  it('considers two OTPs with different values as not equal', () => {
    const otp1 = Otp.create('123456');
    const otp2 = Otp.create('654321');

    expect(otp1.equals(otp2)).toBe(false);
  });
});

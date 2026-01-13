import { Email } from '../../domain/value-objects/Email';

describe('The Email', () => {
  it('accepts a valid email format', () => {
    const email = Email.create('user@domain.com');

    expect(email.value).toBe('user@domain.com');
  });

  it('does not allow email without @', () => {
    expect(() => Email.create('userdomain.com')).toThrow('Invalid email format');
  });

  it('does not allow email without domain', () => {
    expect(() => Email.create('user@')).toThrow('Invalid email format');
  });

  it('does not allow empty email', () => {
    expect(() => Email.create('')).toThrow('Invalid email format');
  });

  it('considers two emails with same value as equal', () => {
    const email1 = Email.create('user@domain.com');
    const email2 = Email.create('user@domain.com');

    expect(email1.equals(email2)).toBe(true);
  });

  it('considers two emails with different values as not equal', () => {
    const email1 = Email.create('user1@domain.com');
    const email2 = Email.create('user2@domain.com');

    expect(email1.equals(email2)).toBe(false);
  });
});

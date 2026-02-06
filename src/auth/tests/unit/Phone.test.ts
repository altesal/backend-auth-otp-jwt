import { Phone } from '../../domain/value-objects/Phone';

describe('The Phone value object', () => {
  it('allows empty phone (optional field)', () => {
    const phone = Phone.create('');

    expect(phone.value).toBe('');
  });

  it('accepts valid international format (+34612345678)', () => {
    const phone = Phone.create('+34612345678');

    expect(phone.value).toBe('+34612345678');
  });

  it('rejects invalid phone format', () => {
    expect(() => Phone.create('12345')).toThrow('Invalid phone format');
  });
});

import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { Phone } from '../../domain/value-objects/Phone';
import { Id } from '../../../shared/domain/value-objects/Id';

describe('The User', () => {
  it('is identified by a unique id when created', () => {
    const email = Email.create('user@domain.com');

    const user = User.create(email);

    expect(user.id).toBeDefined();
    expect(user.email.equals(email)).toBe(true);
  });

  it('starts with empty profile information', () => {
    const email = Email.create('user@domain.com');

    const user = User.create(email);

    expect(user.fullName()).toBe('');
    expect(user.phone().value).toBe('');
  });

  it('accepts profile updates with fullName and phone', () => {
    const email = Email.create('user@domain.com');
    const user = User.create(email);

    user.updateProfile('John Doe', Phone.create('+34612345678'));

    expect(user.fullName()).toBe('John Doe');
    expect(user.phone().value).toBe('+34612345678');
  });

  it('tracks when it was created', () => {
    const email = Email.create('user@domain.com');
    const before = new Date();

    const user = User.create(email);

    expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('considers two users with same id as equal', () => {
    const email = Email.create('user@domain.com');
    const id = Id.generate();
    const user1 = User.reconstitute(id, email, new Date(), '', Phone.create(''));
    const user2 = User.reconstitute(id, email, new Date(), '', Phone.create(''));

    expect(user1.equals(user2)).toBe(true);
  });

  it('considers two users with different ids as not equal', () => {
    const email = Email.create('user@domain.com');
    const user1 = User.create(email);
    const user2 = User.create(email);

    expect(user1.equals(user2)).toBe(false);
  });

  it('exposes its data for persistence', () => {
    const email = Email.create('user@domain.com');
    const user = User.create(email);
    user.updateProfile('John Doe', Phone.create('+34612345678'));

    const primitives = user.toPrimitives();

    expect(primitives.id).toBe(user.id.value);
    expect(primitives.email).toBe('user@domain.com');
    expect(primitives.createdAt).toBeDefined();
    expect(primitives.fullName).toBe('John Doe');
    expect(primitives.phone).toBe('+34612345678');
  });

  it('can be reconstituted from persisted data', () => {
    const id = Id.generate();
    const email = Email.create('user@domain.com');
    const createdAt = new Date();
    const fullName = 'John Doe';
    const phone = Phone.create('+34612345678');

    const user = User.reconstitute(id, email, createdAt, fullName, phone);

    expect(user.id.equals(id)).toBe(true);
    expect(user.email.equals(email)).toBe(true);
    expect(user.createdAt).toBe(createdAt);
    expect(user.fullName()).toBe(fullName);
    expect(user.phone().value).toBe('+34612345678');
  });
});

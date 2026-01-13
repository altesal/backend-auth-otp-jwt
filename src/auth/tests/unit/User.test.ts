import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { Id } from '../../../shared/domain/value-objects/Id';

describe('The User', () => {
  it('creates with email and generates id', () => {
    const email = Email.create('user@domain.com');

    const user = User.create(email);

    expect(user.id).toBeDefined();
    expect(user.email.equals(email)).toBe(true);
  });

  it('records creation date', () => {
    const email = Email.create('user@domain.com');
    const before = new Date();

    const user = User.create(email);

    expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('considers two users with same id as equal', () => {
    const email = Email.create('user@domain.com');
    const id = Id.generate();
    const user1 = User.reconstitute(id, email, new Date());
    const user2 = User.reconstitute(id, email, new Date());

    expect(user1.equals(user2)).toBe(true);
  });

  it('considers two users with different ids as not equal', () => {
    const email = Email.create('user@domain.com');
    const user1 = User.create(email);
    const user2 = User.create(email);

    expect(user1.equals(user2)).toBe(false);
  });

  it('converts to primitives for persistence', () => {
    const email = Email.create('user@domain.com');

    const user = User.create(email);
    const primitives = user.toPrimitives();

    expect(primitives.id).toBe(user.id.value);
    expect(primitives.email).toBe('user@domain.com');
    expect(primitives.createdAt).toBeDefined();
  });

  it('reconstructs from persistence data', () => {
    const id = Id.generate();
    const email = Email.create('user@domain.com');
    const createdAt = new Date();

    const user = User.reconstitute(id, email, createdAt);

    expect(user.id.equals(id)).toBe(true);
    expect(user.email.equals(email)).toBe(true);
    expect(user.createdAt).toBe(createdAt);
  });
});

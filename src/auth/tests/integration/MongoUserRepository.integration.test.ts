import { MongoUserRepository } from '../../infrastructure/adapters/MongoUserRepository';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { Id } from '../../../shared/domain/value-objects/Id';
import { createTestMongo } from '../../../shared/tests/mongoTestHelper';

describe('The MongoUserRepository', () => {
  let mongo: Awaited<ReturnType<typeof createTestMongo>>;
  let repository: MongoUserRepository;

  beforeAll(async () => {
    mongo = await createTestMongo();
    repository = new MongoUserRepository(mongo.db());
  });

  afterAll(() => mongo.stop());
  beforeEach(() => mongo.clean());

  it('persists and retrieves a user by id', async () => {
    const email = Email.create('user@domain.com');
    const user = User.create(email);

    await repository.save(user);
    const retrieved = await repository.findById(user.id);

    expect(retrieved.isSome()).toBe(true);
    expect(retrieved.getOrThrow().equals(user)).toBe(true);
  });

  it('persists and retrieves a user by email', async () => {
    const email = Email.create('user@domain.com');
    const user = User.create(email);

    await repository.save(user);
    const retrieved = await repository.findByEmail(email);

    expect(retrieved.isSome()).toBe(true);
    expect(retrieved.getOrThrow().email.equals(email)).toBe(true);
  });

  it('indicates absence when user not found by id', async () => {
    const retrieved = await repository.findById(Id.generate());

    expect(retrieved.isNone()).toBe(true);
  });

  it('indicates absence when user not found by email', async () => {
    const retrieved = await repository.findByEmail(Email.create('unknown@domain.com'));

    expect(retrieved.isNone()).toBe(true);
  });
});

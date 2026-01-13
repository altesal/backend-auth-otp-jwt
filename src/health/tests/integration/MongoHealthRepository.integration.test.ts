import { MongoHealthRepository } from '../../infrastructure/adapters/MongoHealthRepository';
import { Health } from '../../domain/entities/Health';
import { Id } from '../../../shared/domain/value-objects/Id';
import { createTestMongo } from '../../../shared/tests/mongoTestHelper';

describe('The MongoHealthRepository', () => {
  let mongo: Awaited<ReturnType<typeof createTestMongo>>;
  let repository: MongoHealthRepository;

  const jan1At10am = new Date('2026-01-01T10:00:00.000Z');
  const jan1At10am5min = new Date('2026-01-01T10:05:00.000Z');
  const fiveMinutesInSeconds = 300;

  beforeAll(async () => {
    mongo = await createTestMongo();
    repository = new MongoHealthRepository(mongo.db());
  });

  afterAll(() => mongo.stop());
  beforeEach(() => mongo.clean());

  it('saves and finds health data', async () => {
    const id = Id.generate();
    const health = Health.create(id, jan1At10am, jan1At10am);

    await repository.save(health);
    const retrieved = await repository.find();

    expect(retrieved.isSome()).toBe(true);
    expect(retrieved.getOrThrow().equals(health)).toBe(true);
  });

  it('finds nothing when empty', async () => {
    const retrieved = await repository.find();

    expect(retrieved.isNone()).toBe(true);
  });

  it('maintains a single record across saves', async () => {
    const id = Id.generate();
    const health = Health.create(id, jan1At10am, jan1At10am);
    await repository.save(health);
    health.update(jan1At10am5min);
    await repository.save(health);

    const retrieved = await repository.find();

    expect(retrieved.getOrThrow().equals(health)).toBe(true);
  });

  it('preserves creation time across updates', async () => {
    const health = Health.create(Id.generate(), jan1At10am, jan1At10am);
    await repository.save(health);
    health.update(jan1At10am5min);
    await repository.save(health);

    const retrieved = await repository.find();
    const foundHealth = retrieved.getOrThrow();
    const primitives = foundHealth.toPrimitives();

    expect(primitives.createdAt).toBe(jan1At10am.toISOString());
    expect(primitives.lastCheckedAt).toBe(jan1At10am5min.toISOString());
    expect(foundHealth.uptime()).toBe(fiveMinutesInSeconds);
  });
});

import { Health } from '../../domain/entities/Health';
import { Id } from '../../../shared/domain/value-objects/Id';

describe('The Health', () => {
  const jan1At10am = new Date('2026-01-01T10:00:00.000Z');
  const jan1At10am5min = new Date('2026-01-01T10:05:00.000Z');
  const fiveMinutesInSeconds = 300;

  it('stores the provided id and timestamps', () => {
    const id = Id.generate();

    const health = Health.create(id, jan1At10am, jan1At10am5min);
    const primitives = health.toPrimitives();

    expect(primitives.id).toBe(id.value);
    expect(primitives.createdAt).toBe(jan1At10am.toISOString());
    expect(primitives.lastCheckedAt).toBe(jan1At10am5min.toISOString());
  });

  it('does not allow creation when lastCheckedAt is before createdAt', () => {
    expect(() => Health.create(Id.generate(), jan1At10am5min, jan1At10am)).toThrow(
      'lastCheckedAt cannot be before createdAt'
    );
  });

  it('updates lastCheckedAt to the given date', () => {
    const health = Health.create(Id.generate(), jan1At10am, jan1At10am);

    health.update(jan1At10am5min);
    const primitives = health.toPrimitives();

    expect(primitives.createdAt).toBe(jan1At10am.toISOString());
    expect(primitives.lastCheckedAt).toBe(jan1At10am5min.toISOString());
  });

  it('does not allow update when date is before createdAt', () => {
    const health = Health.create(Id.generate(), jan1At10am5min, jan1At10am5min);

    expect(() => health.update(jan1At10am)).toThrow('lastCheckedAt cannot be before createdAt');
  });

  it('calculates uptime in seconds', () => {
    const health = Health.create(Id.generate(), jan1At10am, jan1At10am5min);

    expect(health.uptime()).toBe(fiveMinutesInSeconds);
  });

  it('has zero uptime when just created', () => {
    const health = Health.create(Id.generate(), jan1At10am, jan1At10am);

    expect(health.uptime()).toBe(0);
  });

  it('is equal to another Health with same id and timestamps', () => {
    const id = Id.generate();
    const health1 = Health.create(id, jan1At10am, jan1At10am5min);
    const health2 = Health.create(id, jan1At10am, jan1At10am5min);

    expect(health1.equals(health2)).toBe(true);
  });

  it('is not equal when ids differ', () => {
    const health1 = Health.create(Id.generate(), jan1At10am, jan1At10am5min);
    const health2 = Health.create(Id.generate(), jan1At10am, jan1At10am5min);

    expect(health1.equals(health2)).toBe(false);
  });

  it('is not equal when createdAt differs', () => {
    const id = Id.generate();
    const health1 = Health.create(id, jan1At10am, jan1At10am5min);
    const health2 = Health.create(id, jan1At10am5min, jan1At10am5min);

    expect(health1.equals(health2)).toBe(false);
  });

  it('is not equal when lastCheckedAt differs', () => {
    const id = Id.generate();
    const health1 = Health.create(id, jan1At10am, jan1At10am);
    const health2 = Health.create(id, jan1At10am, jan1At10am5min);

    expect(health1.equals(health2)).toBe(false);
  });
});

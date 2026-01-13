import { Health } from '../domain/entities/Health';
import { HealthRepository } from '../domain/repositories/HealthRepository';
import { Id } from '../../shared/domain/value-objects/Id';

export interface HealthDto {
  id: string;
  status: 'healthy';
  createdAt: string;
  lastCheckedAt: string;
}

export class HealthUseCase {
  constructor(private healthRepository: HealthRepository) {}

  async execute(): Promise<HealthDto> {
    const now = new Date();
    const maybeHealth = await this.healthRepository.find();
    const health = maybeHealth.fold(
      () => Health.create(Id.generate(), now, now),
      (existing) => {
        existing.update(now);
        return existing;
      }
    );
    await this.healthRepository.save(health);
    return this.toDto(health);
  }

  private toDto(health: Health): HealthDto {
    const primitives = health.toPrimitives();
    return {
      id: primitives.id,
      status: 'healthy',
      createdAt: primitives.createdAt,
      lastCheckedAt: primitives.lastCheckedAt,
    };
  }
}

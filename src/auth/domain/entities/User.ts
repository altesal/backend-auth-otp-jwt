import { Id } from '../../../shared/domain/value-objects/Id';
import { Email } from '../value-objects/Email';

export class User {
  private constructor(
    readonly id: Id,
    readonly email: Email,
    readonly createdAt: Date
  ) {}

  static create(email: Email): User {
    return new User(Id.generate(), email, new Date());
  }

  static reconstitute(id: Id, email: Email, createdAt: Date): User {
    return new User(id, email, createdAt);
  }

  equals(other: User): boolean {
    return this.id.equals(other.id);
  }

  toPrimitives() {
    return {
      id: this.id.value,
      email: this.email.value,
      createdAt: this.createdAt.toISOString(),
    };
  }
}

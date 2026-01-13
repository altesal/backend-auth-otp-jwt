import { Maybe } from '../../../shared/domain/Maybe';
import { User } from '../entities/User';
import { Email } from '../value-objects/Email';
import { Id } from '../../../shared/domain/value-objects/Id';

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: Id): Promise<Maybe<User>>;
  findByEmail(email: Email): Promise<Maybe<User>>;
}

export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  constructor(initialUsers: User[] = []) {
    initialUsers.forEach((user) => this.users.set(user.id.value, user));
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id.value, user);
  }

  async findById(id: Id): Promise<Maybe<User>> {
    return Maybe.fromNullable(this.users.get(id.value));
  }

  async findByEmail(email: Email): Promise<Maybe<User>> {
    const user = Array.from(this.users.values()).find((u) => u.email.equals(email));
    return Maybe.fromNullable(user);
  }
}

import { Collection, Db } from 'mongodb';
import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { Email } from '../../domain/value-objects/Email';
import { Phone } from '../../domain/value-objects/Phone';
import { Id } from '../../../shared/domain/value-objects/Id';
import { Maybe } from '../../../shared/domain/Maybe';

interface UserDocument {
  _id: string;
  email: string;
  fullName: string;
  phone: string;
  createdAt: string;
}

export class MongoUserRepository implements UserRepository {
  private collection: Collection<UserDocument>;

  constructor(db: Db) {
    this.collection = db.collection<UserDocument>('users');
  }

  async save(user: User): Promise<void> {
    const document = this.toDocument(user);
    await this.collection.updateOne({ _id: document._id }, { $set: document }, { upsert: true });
  }

  async findById(id: Id): Promise<Maybe<User>> {
    const document = await this.collection.findOne({ _id: id.value });
    return Maybe.fromNullable(document).map((doc) => this.toDomain(doc));
  }

  async findByEmail(email: Email): Promise<Maybe<User>> {
    const document = await this.collection.findOne({ email: email.value });
    return Maybe.fromNullable(document).map((doc) => this.toDomain(doc));
  }

  private toDocument(user: User): UserDocument {
    const primitives = user.toPrimitives();
    return {
      _id: primitives.id,
      email: primitives.email,
      fullName: primitives.fullName,
      phone: primitives.phone,
      createdAt: primitives.createdAt,
    };
  }

  private toDomain(document: UserDocument): User {
    return User.reconstitute(
      Id.create(document._id),
      Email.create(document.email),
      new Date(document.createdAt),
      document.fullName || '',
      Phone.create(document.phone || '')
    );
  }
}

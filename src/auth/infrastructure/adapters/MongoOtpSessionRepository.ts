import { Collection, Db } from 'mongodb';
import { OtpSession } from '../../domain/entities/OtpSession';
import { OtpSessionRepository } from '../../domain/repositories/OtpSessionRepository';
import { Email } from '../../domain/value-objects/Email';
import { Otp } from '../../domain/value-objects/Otp';
import { Id } from '../../../shared/domain/value-objects/Id';
import { Maybe } from '../../../shared/domain/Maybe';

interface OtpSessionDocument {
  _id: string;
  sessionId: string;
  otp: string;
  attempts: number;
  expiresAt: string;
  blockedUntil: string | null;
}

export class MongoOtpSessionRepository implements OtpSessionRepository {
  private collection: Collection<OtpSessionDocument>;

  constructor(db: Db) {
    this.collection = db.collection<OtpSessionDocument>('otp_sessions');
  }

  async save(session: OtpSession): Promise<void> {
    const document = this.toDocument(session);
    await this.collection.replaceOne({ _id: document._id }, document, {
      upsert: true,
    });
  }

  async findByEmail(email: Email): Promise<Maybe<OtpSession>> {
    const document = await this.collection.findOne({ _id: email.value });
    return Maybe.fromNullable(document).map((doc) => this.toDomain(doc));
  }

  async deleteByEmail(email: Email): Promise<void> {
    await this.collection.deleteOne({ _id: email.value });
  }

  private toDocument(session: OtpSession): OtpSessionDocument {
    const primitives = session.toPrimitives();
    return {
      _id: primitives.email,
      sessionId: primitives.id,
      otp: primitives.otp,
      attempts: primitives.attempts,
      expiresAt: primitives.expiresAt,
      blockedUntil: primitives.blockedUntil,
    };
  }

  private toDomain(document: OtpSessionDocument): OtpSession {
    return OtpSession.reconstitute(
      Id.create(document.sessionId),
      Email.create(document._id),
      Otp.create(document.otp),
      document.attempts,
      new Date(document.expiresAt),
      document.blockedUntil ? new Date(document.blockedUntil) : null
    );
  }
}

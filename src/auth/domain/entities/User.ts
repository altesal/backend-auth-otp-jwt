import { Id } from '../../../shared/domain/value-objects/Id';
import { Email } from '../value-objects/Email';
import { Phone } from '../value-objects/Phone';

export class User {
  private currentFullName: string;
  private currentPhone: Phone;

  private constructor(
    readonly id: Id,
    readonly email: Email,
    readonly createdAt: Date,
    fullName: string,
    phone: Phone
  ) {
    this.currentFullName = fullName;
    this.currentPhone = phone;
  }

  static create(email: Email): User {
    return new User(Id.generate(), email, new Date(), '', Phone.create(''));
  }

  static reconstitute(id: Id, email: Email, createdAt: Date, fullName: string, phone: Phone): User {
    return new User(id, email, createdAt, fullName, phone);
  }

  fullName(): string {
    return this.currentFullName;
  }

  phone(): Phone {
    return this.currentPhone;
  }

  updateProfile(fullName: string, phone: Phone): void {
    this.currentFullName = fullName;
    this.currentPhone = phone;
  }

  equals(other: User): boolean {
    return this.id.equals(other.id);
  }

  toPrimitives() {
    return {
      id: this.id.value,
      email: this.email.value,
      fullName: this.currentFullName,
      phone: this.currentPhone.toPrimitives(),
      createdAt: this.createdAt.toISOString(),
    };
  }
}

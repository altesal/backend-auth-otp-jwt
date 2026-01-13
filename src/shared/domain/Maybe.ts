type Some<T> = { tag: 'some'; value: T };
type None = { tag: 'none' };
type MaybeState<T> = Some<T> | None;

export class Maybe<T> {
  private constructor(private readonly state: MaybeState<T>) {}

  static some<T>(value: T): Maybe<T> {
    return new Maybe({ tag: 'some', value });
  }

  static none<T>(): Maybe<T> {
    return new Maybe<T>({ tag: 'none' });
  }

  static fromNullable<T>(value: T | null | undefined): Maybe<T> {
    if (value === null || value === undefined) {
      return Maybe.none();
    }
    return Maybe.some(value);
  }

  isSome(): boolean {
    return this.state.tag === 'some';
  }

  isNone(): boolean {
    return this.state.tag === 'none';
  }

  map<U>(fn: (value: T) => U): Maybe<U> {
    if (this.state.tag === 'none') {
      return Maybe.none();
    }
    return Maybe.some(fn(this.state.value));
  }

  flatMap<U>(fn: (value: T) => Maybe<U>): Maybe<U> {
    if (this.state.tag === 'none') {
      return Maybe.none();
    }
    return fn(this.state.value);
  }

  getOrElse(defaultValue: T): T {
    if (this.state.tag === 'none') {
      return defaultValue;
    }
    return this.state.value;
  }

  getOrThrow(): T {
    if (this.state.tag === 'none') {
      throw new Error('Called getOrThrow on None');
    }
    return this.state.value;
  }

  fold<U>(onNone: () => U, onSome: (value: T) => U): U {
    if (this.state.tag === 'none') {
      return onNone();
    }
    return onSome(this.state.value);
  }
}

import { Maybe } from '../../domain/Maybe';

describe('The Maybe', () => {
  const double = (x: number) => x * 2;
  const increment = (x: number) => x + 1;
  const toMaybeDouble = (x: number) => Maybe.some(x * 2);
  const toMaybeIncrement = (x: number) => Maybe.some(x + 1);

  describe('Functor Laws', () => {
    it('satisfies identity law for Some', () => {
      const maybe = Maybe.some(5);

      const result = maybe.map((x) => x);

      expect(result.getOrElse(0)).toBe(maybe.getOrElse(0));
    });

    it('satisfies identity law for None', () => {
      const maybe = Maybe.none<number>();

      const result = maybe.map((x) => x);

      expect(result.isNone()).toBe(true);
    });

    it('satisfies composition law for Some', () => {
      const maybe = Maybe.some(5);

      const mapTwice = maybe.map(double).map(increment);
      const mapComposed = maybe.map((x) => increment(double(x)));

      expect(mapTwice.getOrElse(0)).toBe(mapComposed.getOrElse(0));
    });

    it('satisfies composition law for None', () => {
      const maybe = Maybe.none<number>();

      const mapTwice = maybe.map(double).map(increment);
      const mapComposed = maybe.map((x) => increment(double(x)));

      expect(mapTwice.isNone()).toBe(mapComposed.isNone());
    });
  });

  describe('Monad Laws', () => {
    it('satisfies left identity', () => {
      const value = 5;

      const leftSide = Maybe.some(value).flatMap(toMaybeDouble);
      const rightSide = toMaybeDouble(value);

      expect(leftSide.getOrElse(0)).toBe(rightSide.getOrElse(0));
    });

    it('satisfies right identity', () => {
      const maybe = Maybe.some(5);

      const result = maybe.flatMap(Maybe.some);

      expect(result.getOrElse(0)).toBe(maybe.getOrElse(0));
    });

    it('satisfies associativity', () => {
      const maybe = Maybe.some(5);

      const leftSide = maybe.flatMap(toMaybeDouble).flatMap(toMaybeIncrement);
      const rightSide = maybe.flatMap((x) => toMaybeDouble(x).flatMap(toMaybeIncrement));

      expect(leftSide.getOrElse(0)).toBe(rightSide.getOrElse(0));
    });
  });

  describe('Constructors', () => {
    it('wraps a value as Some', () => {
      const maybe = Maybe.some(42);

      expect(maybe.isSome()).toBe(true);
      expect(maybe.isNone()).toBe(false);
    });

    it('represents absence as None', () => {
      const maybe = Maybe.none();

      expect(maybe.isNone()).toBe(true);
      expect(maybe.isSome()).toBe(false);
    });

    it('lifts a present value to Some', () => {
      const maybe = Maybe.fromNullable(42);

      expect(maybe.isSome()).toBe(true);
    });

    it('lifts null to None', () => {
      const maybe = Maybe.fromNullable(null);

      expect(maybe.isNone()).toBe(true);
    });

    it('lifts undefined to None', () => {
      const maybe = Maybe.fromNullable(undefined);

      expect(maybe.isNone()).toBe(true);
    });
  });

  describe('Extraction', () => {
    it('extracts the value when present', () => {
      const maybe = Maybe.some(42);

      expect(maybe.getOrElse(0)).toBe(42);
    });

    it('falls back to default when absent', () => {
      const maybe = Maybe.none<number>();

      expect(maybe.getOrElse(0)).toBe(0);
    });

    it('extracts safely when present', () => {
      const maybe = Maybe.some(42);

      expect(maybe.getOrThrow()).toBe(42);
    });

    it('fails when extracting from absent', () => {
      const maybe = Maybe.none<number>();

      expect(() => maybe.getOrThrow()).toThrow('Called getOrThrow on None');
    });

    it('applies transformation when present', () => {
      const maybe = Maybe.some(42);

      const result = maybe.fold(
        () => 'none',
        (x) => `value: ${x}`
      );

      expect(result).toBe('value: 42');
    });

    it('applies fallback when absent', () => {
      const maybe = Maybe.none<number>();

      const result = maybe.fold(
        () => 'none',
        (x) => `value: ${x}`
      );

      expect(result).toBe('none');
    });
  });
});

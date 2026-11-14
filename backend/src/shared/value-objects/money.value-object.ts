import { UnprocessableEntityException } from '@nestjs/common';

const INTEGER_PATTERN = /^-?\d+$/;
const MAX_VALUE = 10n ** 15n;

/**
 * VND amount. VND has no minor unit, so the value is always a whole number.
 * Stored as bigint to avoid floating point and decimal string arithmetic.
 */
export class Money {
  private constructor(private readonly value: bigint) {}

  public static create(raw: string | number | bigint): Money {
    const value = Money.parse(raw);

    if (value < 0n) {
      throw new UnprocessableEntityException('Amount can not be less than 0');
    }

    if (value >= MAX_VALUE) {
      throw new UnprocessableEntityException(
        'Amount is too large (max value: 10^15)',
      );
    }

    return new Money(value);
  }

  private static parse(raw: string | number | bigint): bigint {
    if (typeof raw === 'bigint') {
      return raw;
    }

    if (typeof raw === 'number') {
      if (!Number.isSafeInteger(raw)) {
        throw new UnprocessableEntityException(
          'Amount must be an integer in VND',
        );
      }

      return BigInt(raw);
    }

    const text = typeof raw === 'string' ? raw.trim() : '';

    if (!INTEGER_PATTERN.test(text)) {
      throw new UnprocessableEntityException(
        `Invalid amount: "${raw}" is not an integer in VND`,
      );
    }

    return BigInt(text);
  }

  public add(other: Money): Money {
    return new Money(this.value + other.value);
  }

  public multiply(factor: number): Money {
    if (!Number.isSafeInteger(factor) || factor < 0) {
      throw new UnprocessableEntityException(
        'Amount multiplier must be a non-negative integer',
      );
    }

    return new Money(this.value * BigInt(factor));
  }

  public getValue(): bigint {
    return this.value;
  }

  public equals(other: Money): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value.toString();
  }
}

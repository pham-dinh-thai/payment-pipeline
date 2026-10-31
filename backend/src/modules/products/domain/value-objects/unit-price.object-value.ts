import { UnprocessableEntityException } from '@nestjs/common';
import Decimal from 'decimal.js';

export class UnitPrice {
  private static readonly PRECISION = 12;
  private static readonly SCALE = 2;
  private static readonly MAX_VALUE = new Decimal(10).pow(
    UnitPrice.PRECISION - UnitPrice.SCALE,
  ); // Value can not be greater than 10^10

  private constructor(private readonly value: Decimal) {}

  public static create(raw: string): UnitPrice {
    let value: Decimal;
    try {
      value = new Decimal(raw);
    } catch {
      throw new UnprocessableEntityException(`Invalid unit price: "${raw}"`);
    }

    if (!value.isFinite()) {
      throw new UnprocessableEntityException(
        'Unit price must be a finite number',
      );
    }

    if (value.isNegative()) {
      throw new UnprocessableEntityException(
        'Unit price can not be less than 0',
      );
    }

    if (value.decimalPlaces() > UnitPrice.SCALE) {
      throw new UnprocessableEntityException(
        `Unit price must have at most ${UnitPrice.SCALE} decimal places`,
      );
    }

    if (value.greaterThanOrEqualTo(UnitPrice.MAX_VALUE)) {
      throw new UnprocessableEntityException(
        'Unit price is too large (max value: 10^10)',
      );
    }

    return new UnitPrice(value);
  }

  public equals(other: UnitPrice): boolean {
    return this.value.eq(other.value);
  }

  public toString(): string {
    return this.value.toFixed(UnitPrice.SCALE);
  }
}

import { UnprocessableEntityException } from '@nestjs/common';
import Decimal from 'decimal.js';

export class UnitCost {
  private static readonly PRECISION = 12;
  private static readonly SCALE = 2;
  private static readonly MAX_VALUE = new Decimal(10).pow(
    UnitCost.PRECISION - UnitCost.SCALE,
  ); // Value can not be greater than 10^10

  private constructor(private readonly value: Decimal) {}

  public static create(raw: string): UnitCost {
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

    if (value.decimalPlaces() > UnitCost.SCALE) {
      throw new UnprocessableEntityException(
        `Unit price must have at most ${UnitCost.SCALE} decimal places`,
      );
    }

    if (value.greaterThanOrEqualTo(UnitCost.MAX_VALUE)) {
      throw new UnprocessableEntityException(
        'Unit price is too large (max value: 10^10)',
      );
    }

    return new UnitCost(value);
  }

  public getTotal(quantity: number): string {
    const total = this.value.mul(quantity);

    return total.toFixed(UnitCost.SCALE);
  }

  public equals(other: UnitCost): boolean {
    return this.value.eq(other.value);
  }

  public toString(): string {
    return this.value.toFixed(UnitCost.SCALE);
  }
}

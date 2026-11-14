import { Money } from '../../../../shared/value-objects/money.value-object';

/**
 * Product price in VND. VND has no minor unit, so values are whole numbers.
 */
export class UnitPrice {
  private constructor(private readonly value: Money) {}

  public static create(raw: string | number | bigint): UnitPrice {
    return new UnitPrice(Money.create(raw));
  }

  public equals(other: UnitPrice): boolean {
    return this.value.equals(other.value);
  }

  public toString(): string {
    return this.value.toString();
  }
}

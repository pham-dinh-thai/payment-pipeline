import { Money } from './money.value-object';

/**
 * Per-unit price in VND. Pure value semantics: usable by any aggregate that
 * deals with prices.
 */
export class UnitCost {
  private constructor(private readonly value: Money) {}

  public static create(raw: string | number | bigint): UnitCost {
    return new UnitCost(Money.create(raw));
  }

  public getTotal(quantity: number): string {
    return this.value.multiply(quantity).toString();
  }

  public equals(other: UnitCost): boolean {
    return this.value.equals(other.value);
  }

  public toString(): string {
    return this.value.toString();
  }
}

import { UnprocessableEntityException } from '@nestjs/common';

export class Quantity {
  private constructor(private readonly value: number) {}

  public static create(value: number): Quantity {
    if (!Number.isInteger(value)) {
      throw new UnprocessableEntityException('Quantity must be an integer');
    }

    if (value < 0) {
      throw new UnprocessableEntityException('Quantity can not be less than 0');
    }

    return new Quantity(value);
  }

  public add(quantity: number): Quantity {
    return Quantity.create(this.value + quantity);
  }

  public subtract(quantity: number): Quantity {
    return Quantity.create(this.value - quantity);
  }

  public isZero(): boolean {
    return this.value === 0;
  }

  public equals(other: Quantity): boolean {
    return this.value === other.value;
  }

  public getValue(): number {
    return this.value;
  }
}

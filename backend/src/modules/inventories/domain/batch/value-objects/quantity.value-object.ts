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

  public static assertPositive(value: number, label: string): void {
    if (!Number.isInteger(value) || value <= 0) {
      throw new UnprocessableEntityException(
        `${label} must be a positive integer`,
      );
    }
  }

  public increase(quantity: number): Quantity {
    return Quantity.create(this.value + quantity);
  }

  public decrease(quantity: number): Quantity {
    if (quantity > this.value) {
      throw new UnprocessableEntityException(
        `Not enough stock: available ${this.value}, requested ${quantity}`,
      );
    }

    return Quantity.create(this.value - quantity);
  }

  public getValue(): number {
    return this.value;
  }
}

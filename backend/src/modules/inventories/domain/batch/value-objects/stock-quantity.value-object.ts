import { UnprocessableEntityException } from '@nestjs/common';
import { Quantity } from '../../../../../shared/domain/value-objects/quantity.value-object';

export class StockQuantity {
  private constructor(private readonly quantity: Quantity) {}

  public static create(value: number): StockQuantity {
    return new StockQuantity(Quantity.create(value));
  }

  public static assertPositive(value: number, label: string): void {
    if (!Number.isInteger(value) || value <= 0) {
      throw new UnprocessableEntityException(
        `${label} must be a positive integer`,
      );
    }
  }

  public increase(quantity: number): StockQuantity {
    return new StockQuantity(this.quantity.add(quantity));
  }

  public decrease(quantity: number): StockQuantity {
    if (quantity > this.quantity.getValue()) {
      throw new UnprocessableEntityException(
        `Not enough stock: available ${this.quantity.getValue()}, requested ${quantity}`,
      );
    }

    return new StockQuantity(this.quantity.subtract(quantity));
  }

  public getValue(): number {
    return this.quantity.getValue();
  }
}

import { UnprocessableEntityException } from '@nestjs/common';

export class Quantity {
  private constructor(private readonly value: number) {}

  public static create(value: number): Quantity {
    if (!Number.isInteger(value)) {
      throw new UnprocessableEntityException('Quantity must be a Integer');
    }

    if (value < 0) {
      throw new UnprocessableEntityException('Quantity can not be less than 0');
    }

    return new Quantity(value);
  }

  public getValue(): number {
    return this.value;
  }
}

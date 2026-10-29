import { DomainValidationException } from '../../../../shared/domain/domain-validation.error';

export class Quantity {
  private constructor(private readonly value: number) {}

  public static create(value: number): Quantity {
    if (!Number.isInteger(value)) {
      throw new DomainValidationException('Quantity must be a Integer');
    }

    if (value < 0) {
      throw new DomainValidationException('Quantity can not be less than 0');
    }

    return new Quantity(value);
  }

  public getValue(): number {
    return this.value;
  }
}

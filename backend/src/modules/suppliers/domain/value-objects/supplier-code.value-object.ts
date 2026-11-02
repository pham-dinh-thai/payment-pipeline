import { UnprocessableEntityException } from '@nestjs/common';

export class SupplierCode {
  private static readonly MAX_LENGTH = 50;

  private constructor(private readonly value: string) {}

  public static create(raw: string): SupplierCode {
    const trimmed = raw?.trim();

    if (!trimmed) {
      throw new UnprocessableEntityException('Supplier code is required');
    }

    if (trimmed.length > SupplierCode.MAX_LENGTH) {
      throw new UnprocessableEntityException('Supplier code is too long');
    }

    return new SupplierCode(trimmed);
  }

  public getValue(): string {
    return this.value;
  }
}

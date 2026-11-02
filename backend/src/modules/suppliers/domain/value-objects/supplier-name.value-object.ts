import { UnprocessableEntityException } from '@nestjs/common';

export class SupplierName {
  private static readonly MAX_LENGTH = 255;

  private constructor(private readonly value: string) {}

  public static create(raw: string): SupplierName {
    const trimmed = raw?.trim();

    if (!trimmed) {
      throw new UnprocessableEntityException('Supplier name is required');
    }

    if (trimmed.length > SupplierName.MAX_LENGTH) {
      throw new UnprocessableEntityException('Supplier name is too long');
    }

    return new SupplierName(trimmed);
  }

  public getValue(): string {
    return this.value;
  }
}

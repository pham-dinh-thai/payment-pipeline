import { UnprocessableEntityException } from '@nestjs/common';

export class SupplierCode {
  private static readonly PREFIX = 'SUP';
  private static readonly MIN_DIGITS = 4;
  private static readonly PATTERN = /^SUP-(\d+)$/;

  private constructor(private readonly value: string) {}

  // Generate code from sequence (sequence = 12 -> SUP-0012)
  public static fromNumber(sequence: number): SupplierCode {
    if (!Number.isInteger(sequence) || sequence <= 0) {
      throw new UnprocessableEntityException('Invalid supplier code sequence');
    }

    const digits = String(sequence).padStart(SupplierCode.MIN_DIGITS, '0');

    return new SupplierCode(`${SupplierCode.PREFIX}-${digits}`);
  }

  // Create from DB
  public static create(raw: unknown): SupplierCode {
    if (typeof raw !== 'string' || !SupplierCode.PATTERN.test(raw.trim())) {
      throw new UnprocessableEntityException('Invalid supplier code format');
    }

    return new SupplierCode(raw.trim());
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: SupplierCode): boolean {
    return this.value === other.value;
  }
}

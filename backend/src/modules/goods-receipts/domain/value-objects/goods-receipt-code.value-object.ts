import { UnprocessableEntityException } from '@nestjs/common';

export class GoodsReceiptCode {
  private static readonly PREFIX = 'GR';
  private static readonly MIN_DIGITS = 4;
  private static readonly PATTERN = /^GR-(\d+)$/;

  private constructor(private readonly value: string) {}

  public static fromNumber(sequence: number): GoodsReceiptCode {
    if (!Number.isInteger(sequence) || sequence <= 0) {
      throw new UnprocessableEntityException(
        'Invalid goods receipt code sequence',
      );
    }

    const digits = String(sequence).padStart(GoodsReceiptCode.MIN_DIGITS, '0');

    return new GoodsReceiptCode(`${GoodsReceiptCode.PREFIX}-${digits}`);
  }

  public static create(raw: unknown): GoodsReceiptCode {
    if (typeof raw !== 'string' || !GoodsReceiptCode.PATTERN.test(raw.trim())) {
      throw new UnprocessableEntityException(
        'Invalid goods receipt code format',
      );
    }

    return new GoodsReceiptCode(raw.trim());
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: GoodsReceiptCode): boolean {
    return this.value === other.value;
  }
}

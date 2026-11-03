import { UnprocessableEntityException } from '@nestjs/common';

// +84, 84 or 0
const PREFIX = '(?:\\+84|84|0)';

/**
 * Mobile number (the first two digits after the prefix), according to the network provider:
 *
 * 3[2-9]  -> 032-039        Viettel
 * 5[2689] -> 052,056,058    Vietnamobile
 *            059            Gmobile
 * 7[06-9] -> 070,076-079    MobiFone
 * 8[1-9]  -> 081-085,088    Vinaphone
 *            086            Viettel
 *            087            iTel
 *            089            MobiFone
 * 9\d     -> 090,093        MobiFone
 *            091,094        Vinaphone
 *            092            Vietnamobile
 *            096-098        Viettel
 *            099            Gmobile
 */
const MOBILE_HEAD = '(?:3[2-9]|5[2689]|7[06-9]|8[1-9]|9\\d)';

// Mobile head + remaining 7 digits (total of 10 numbers including the first 0)
const MOBILE = `${MOBILE_HEAD}\\d{7}`;

// Landline: starts with 2, a total of 11 digits including the first 0 (e.g., 024 3825 1234).
// Do not check if the area code exists.
const LANDLINE = '2\\d{9}';

export class SupplierPhone {
  private static readonly VIETNAM_PHONE_NUMBER_PATTERN = new RegExp(
    `^${PREFIX}(?:${MOBILE}|${LANDLINE})$`,
  );

  private constructor(private readonly value: string) {}

  public static create(number: unknown): SupplierPhone {
    if (typeof number !== 'string' || !number.trim()) {
      throw new UnprocessableEntityException('Phone number is required');
    }

    const cleaned = number.replace(/[\s.\-()]/g, ''); // Remove spaces, periods, hyphens, and parentheses

    if (!SupplierPhone.VIETNAM_PHONE_NUMBER_PATTERN.test(cleaned)) {
      throw new UnprocessableEntityException('Invalid Vietnam phone number');
    }

    return new SupplierPhone(SupplierPhone.normalize(cleaned));
  }

  public equals(other: SupplierPhone): boolean {
    return this.value === other.value;
  }

  public getValue(): string {
    return this.value;
  }

  // Return to the 0xxxxxxxxx format
  private static normalize(cleaned: string): string {
    if (cleaned.startsWith('+84')) {
      return '0' + cleaned.slice(3);
    }

    if (cleaned.startsWith('84')) {
      return '0' + cleaned.slice(2);
    }

    return cleaned;
  }
}

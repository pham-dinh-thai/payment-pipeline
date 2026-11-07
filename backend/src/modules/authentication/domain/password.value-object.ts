import { BadRequestException } from '@nestjs/common';
import * as argon2 from 'argon2';

export class Password {
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 128;

  private constructor(private readonly value: string) {}

  public static async fromPlainText(plain: string): Promise<Password> {
    Password.validate(plain);

    const hashed = await argon2.hash(plain, {
      type: argon2.argon2id,
      memoryCost: 19456, // KiB (~19 MiB)
      timeCost: 2,
      parallelism: 1,
    });

    return new Password(hashed);
  }

  public static fromHashed(hashed: string): Password {
    return new Password(hashed);
  }

  public async verify(plain: string): Promise<boolean> {
    return argon2.verify(this.value, plain);
  }

  public getValue(): string {
    return this.value;
  }

  private static validate(plain: string): void {
    if (plain.length < Password.MIN_LENGTH) {
      throw new BadRequestException(
        `Password must be at least ${Password.MIN_LENGTH} characters`,
      );
    }

    if (plain.length > Password.MAX_LENGTH) {
      throw new BadRequestException(
        `Password must not exceed ${Password.MAX_LENGTH} characters`,
      );
    }

    if (!/[A-Za-z]/.test(plain)) {
      throw new BadRequestException(
        'Password must contain at least one letter',
      );
    }

    if (!/\d/.test(plain)) {
      throw new BadRequestException('Password must contain at least one digit');
    }
  }
}

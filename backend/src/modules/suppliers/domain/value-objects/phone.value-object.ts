import { UnprocessableEntityException } from '@nestjs/common';

export class Phone {
  private static readonly MAX_LENGTH = 30;

  private constructor(private readonly value: string) {}

  public static create(raw: string): Phone {
    const trimmed = raw?.trim();

    if (!trimmed) {
      throw new UnprocessableEntityException('Phone number is required');
    }

    if (trimmed.length > Phone.MAX_LENGTH) {
      throw new UnprocessableEntityException('Phone number is too long');
    }

    return new Phone(trimmed);
  }

  public getValue(): string {
    return this.value;
  }
}

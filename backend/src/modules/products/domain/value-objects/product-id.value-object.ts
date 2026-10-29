import { randomUUID } from 'crypto';
import { DomainValidationException } from '../../../../shared/domain/domain-validation.error';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ProductId {
  private constructor(private readonly value: string) {}

  public static generate(): ProductId {
    return new ProductId(randomUUID());
  }

  public static create(value: string): ProductId {
    const trimmed = value?.trim();

    if (!trimmed) {
      throw new DomainValidationException('ProductId is required');
    }

    if (!UUID_V4_REGEX.test(trimmed)) {
      throw new DomainValidationException(
        `Invalid ProductId: "${trimmed}" is not a valid UUID v4`,
      );
    }

    return new ProductId(trimmed);
  }

  public getValue(): string {
    return this.value;
  }
}

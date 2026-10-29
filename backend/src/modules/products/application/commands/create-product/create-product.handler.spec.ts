import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DomainValidationException } from '../../../../../shared/domain/domain-validation.error';
import { Product } from '../../../domain/product.aggregate';
import { CreateProductCommand } from './create-product.command';
import { CreateProductHandler } from './create-product.handler';

describe('CreateProductHandler', () => {
  let create: jest.Mock<(product: Product) => Promise<void>>;
  let handler: CreateProductHandler;

  beforeEach(() => {
    create = jest
      .fn<(product: Product) => Promise<void>>()
      .mockResolvedValue(undefined);

    handler = new CreateProductHandler({ create });
  });

  it('creates a product and returns its id', async () => {
    const result = await handler.execute(
      new CreateProductCommand('Coffee', '12.50', 3),
    );

    expect(result.id).toEqual(expect.any(String));
    expect(create).toHaveBeenCalledTimes(1);

    const product = create.mock.calls[0][0];
    expect(product).toBeInstanceOf(Product);
    expect(product.getId()).toBe(result.id);
    expect(product.getName()).toBe('Coffee');
    expect(product.getUnitPrice()).toBe('12.50');
    expect(product.getQuantity()).toBe(3);
  });

  it('does not persist a product that violates a domain rule', async () => {
    await expect(
      handler.execute(new CreateProductCommand('Tea', '1.234', 1)),
    ).rejects.toThrow(DomainValidationException);

    expect(create).not.toHaveBeenCalled();
  });
});

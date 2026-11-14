import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UnprocessableEntityException } from '@nestjs/common';
import { Product } from '../../../domain/product.aggregate';
import { CreateProductCommand } from './create-product.command';
import { CreateProductHandler } from './create-product.handler';
import { type IOutboxRepository } from '../../../../../shared/modules/outbox/domain/outbox.repository';
import { type IUnitOfWork } from '../../../../../shared/modules/unit-of-work/unit-of-work';
import { PRODUCT_CREATED_EVENT } from '../../../domain/events/product-created.event';
import { EntityType } from '../../../../audit-logs/domain/enums/entity-type.enum';

const headers = {
  actorId: '7d0d2c55-9a9d-4c7d-9f6a-3f7f5a1b2c3d',
  actorType: 'user',
  actorLabel: 'admin@example.com',
  userIp: '127.0.0.1',
  userAgent: 'jest',
};

describe('CreateProductHandler', () => {
  let create: jest.Mock<(product: Product) => Promise<void>>;
  let outboxCreate: jest.Mock<IOutboxRepository['create']>;
  let unitOfWork: IUnitOfWork;
  let handler: CreateProductHandler;

  beforeEach(() => {
    create = jest
      .fn<(product: Product) => Promise<void>>()
      .mockResolvedValue(undefined);

    outboxCreate = jest
      .fn<IOutboxRepository['create']>()
      .mockResolvedValue(undefined);

    unitOfWork = {
      run: async (callback) => callback(),
    };

    handler = new CreateProductHandler(
      {
        create,
        findAll: jest.fn<() => Promise<Product[]>>().mockResolvedValue([]),
        findById: jest
          .fn<(id: string) => Promise<Product | null>>()
          .mockResolvedValue(null),
        existsById: jest
          .fn<(id: string) => Promise<boolean>>()
          .mockResolvedValue(true),
      },
      { create: outboxCreate } as unknown as IOutboxRepository,
      unitOfWork,
    );
  });

  it('creates a product and appends an audit event', async () => {
    const result = await handler.execute(
      new CreateProductCommand('Coffee', '12500', 3, headers),
    );

    expect(result.id).toEqual(expect.any(String));
    expect(create).toHaveBeenCalledTimes(1);

    const product = create.mock.calls[0][0];
    expect(product).toBeInstanceOf(Product);
    expect(product.getId()).toBe(result.id);
    expect(product.getName()).toBe('Coffee');
    expect(product.getUnitPrice()).toBe('12500');
    expect(product.getQuantity()).toBe(3);

    expect(outboxCreate).toHaveBeenCalledWith({
      eventType: PRODUCT_CREATED_EVENT,
      payload: {
        headers,
        audit: {
          entityType: EntityType.PRODUCTS,
          entityId: product.getId(),
          after: {
            name: 'Coffee',
            unitPrice: '12500',
            quantity: 3,
          },
        },
      },
    });
  });

  it('does not persist a product that violates a domain rule', async () => {
    await expect(
      handler.execute(new CreateProductCommand('Tea', '1.234', 1, headers)),
    ).rejects.toThrow(UnprocessableEntityException);

    expect(create).not.toHaveBeenCalled();
    expect(outboxCreate).not.toHaveBeenCalled();
  });
});

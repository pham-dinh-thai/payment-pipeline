import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UnprocessableEntityException } from '@nestjs/common';
import { CreateProductCommand } from '../../application/commands/create-product/create-product.command';
import { ProductsController } from './products.controller';
import { CreateProductRequest } from './requests/create-product.request';

const buildRequest = (): CreateProductRequest =>
  Object.assign(new CreateProductRequest(), {
    name: 'product-1',
    unitPrice: '2333.23',
    quantity: 100,
  });

describe('ProductsController', () => {
  let execute: jest.Mock<
    (command: CreateProductCommand) => Promise<{ id: string }>
  >;
  let controller: ProductsController;

  beforeEach(() => {
    execute = jest
      .fn<(command: CreateProductCommand) => Promise<{ id: string }>>()
      .mockResolvedValue({ id: 'product-1' });

    controller = new ProductsController(
      { execute } as unknown as CommandBus,
      { execute: jest.fn() } as unknown as QueryBus,
    );
  });

  it('dispatches CreateProductCommand and returns the created id', async () => {
    const result = await controller.create(buildRequest());

    expect(execute).toHaveBeenCalledTimes(1);

    const command = execute.mock.calls[0][0];
    expect(command).toBeInstanceOf(CreateProductCommand);
    expect(command).toMatchObject({
      name: 'product-1',
      unitPrice: '2333.23',
      quantity: 100,
    });

    expect(result).toEqual({ id: 'product-1' });
  });

  it('propagates command errors to the caller', async () => {
    const error = new UnprocessableEntityException('invalid product');
    execute.mockRejectedValue(error);

    await expect(controller.create(buildRequest())).rejects.toBe(error);

    expect(execute).toHaveBeenCalledTimes(1);
  });
});

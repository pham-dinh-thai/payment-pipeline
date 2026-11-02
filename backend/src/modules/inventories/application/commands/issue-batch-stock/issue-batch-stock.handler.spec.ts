import { describe, expect, it, jest } from '@jest/globals';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Batch } from '../../../domain/batch/batch.entity';
import { BatchStatus } from '../../../domain/batch/batch-status.enum';
import {
  FindInventoryOptions,
  IInventoriesRepository,
} from '../../../domain/inventories.repository';
import { Inventory } from '../../../domain/inventory.aggregate';
import { IUnitOfWork } from '../../../../../shared/application/unit-of-work';
import { IssueBatchStockCommand } from './issue-batch-stock.command';
import { IssueBatchStockHandler } from './issue-batch-stock.handler';

const PRODUCT_ID = 'b3d7f2a8-7a0e-4f1c-9c1a-4d3f5e6a7b8c';
const CREATED_BY = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
const EXPIRES_AT = new Date('2030-01-01T00:00:00.000Z');

type FindByProductId = (
  productId: string,
  options?: FindInventoryOptions,
) => Promise<Inventory | null>;

type Save = (inventory: Inventory) => Promise<Inventory>;

type Run = (work: () => Promise<unknown>) => Promise<unknown>;

const createInventory = (quantity: number): Inventory => {
  const batch = Batch.create({
    lotNumber: 'LOT-001',
    productId: PRODUCT_ID,
    quantity,
    unitCost: '2.50',
    status: BatchStatus.ACTIVE,
    expiresAt: EXPIRES_AT,
    createdBy: CREATED_BY,
  });

  return Inventory.fromPersistent(PRODUCT_ID, [batch]);
};

const setup = (inventory: Inventory | null) => {
  const findByProductId = jest.fn<FindByProductId>(() =>
    Promise.resolve(inventory),
  );
  const save = jest.fn<Save>((value) => Promise.resolve(value));
  const run = jest.fn<Run>((work) => work());

  const repository: IInventoriesRepository = { findByProductId, save };
  const unitOfWork: IUnitOfWork = {
    run: run as unknown as IUnitOfWork['run'],
  };
  const handler = new IssueBatchStockHandler(repository, unitOfWork);

  return { handler, findByProductId, save, run };
};

describe('IssueBatchStockHandler', () => {
  it('issues stock and saves the inventory inside a unit of work', async () => {
    const inventory = createInventory(10);
    const batchId = inventory.getBatches()[0].getId();
    const { handler, findByProductId, save, run } = setup(inventory);

    const result = await handler.execute(
      new IssueBatchStockCommand(PRODUCT_ID, batchId, 4),
    );

    expect(result).toBe(6);
    expect(inventory.getBatches()[0].getQuantity()).toBe(6);
    expect(findByProductId).toHaveBeenCalledWith(PRODUCT_ID, {
      forUpdate: true,
    });
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(inventory);
    expect(run).toHaveBeenCalledTimes(1);
    expect(run.mock.invocationCallOrder[0]).toBeLessThan(
      findByProductId.mock.invocationCallOrder[0],
    );
  });

  it('throws NotFoundException when inventory does not exist', async () => {
    const { handler, save } = setup(null);

    await expect(
      handler.execute(
        new IssueBatchStockCommand(
          PRODUCT_ID,
          'f1e2d3c4-b5a6-4978-8a9b-0c1d2e3f4a5b',
          1,
        ),
      ),
    ).rejects.toThrow(NotFoundException);

    expect(save).not.toHaveBeenCalled();
  });

  it('rejects issuing more than available and does not save', async () => {
    const inventory = createInventory(10);
    const batchId = inventory.getBatches()[0].getId();
    const { handler, save } = setup(inventory);

    await expect(
      handler.execute(new IssueBatchStockCommand(PRODUCT_ID, batchId, 11)),
    ).rejects.toThrow(UnprocessableEntityException);

    expect(inventory.getBatches()[0].getQuantity()).toBe(10);
    expect(save).not.toHaveBeenCalled();
  });
});

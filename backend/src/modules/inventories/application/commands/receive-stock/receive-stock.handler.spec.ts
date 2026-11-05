import { describe, expect, it, jest } from '@jest/globals';
import { UnprocessableEntityException } from '@nestjs/common';
import { Batch } from '../../../domain/batch/batch.entity';
import { BatchStatus } from '../../../domain/batch/batch-status.enum';
import {
  FindInventoryOptions,
  IInventoriesRepository,
} from '../../../domain/inventories.repository';
import { Inventory } from '../../../domain/inventory.aggregate';
import { IUnitOfWork } from '../../../../../shared/application/unit-of-work';
import { ReceiveStockCommand } from './receive-stock.command';
import { ReceiveStockHandler } from './receive-stock.handler';

const PRODUCT_ID = 'b3d7f2a8-7a0e-4f1c-9c1a-4d3f5e6a7b8c';
const CREATED_BY = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
const EXPIRES_AT = new Date('2030-01-01T00:00:00.000Z');

type FindByProductId = (
  productId: string,
  options?: FindInventoryOptions,
) => Promise<Inventory | null>;

type Save = (inventory: Inventory) => Promise<Inventory>;

type Run = (work: () => Promise<unknown>) => Promise<unknown>;

const createCommand = (
  lotNumber = 'LOT-001',
  quantity = 10,
): ReceiveStockCommand =>
  new ReceiveStockCommand(
    lotNumber,
    PRODUCT_ID,
    quantity,
    '2.50',
    EXPIRES_AT,
    CREATED_BY,
  );

const createInventory = (): Inventory => {
  const batch = Batch.create({
    lotNumber: 'LOT-001',
    productId: PRODUCT_ID,
    quantity: 10,
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
  const handler = new ReceiveStockHandler(repository, unitOfWork);

  return { handler, findByProductId, save, run };
};

describe('ReceiveStockHandler', () => {
  it('creates an inventory when none exists and saves the new batch', async () => {
    const { handler, findByProductId, save, run } = setup(null);

    const result = await handler.execute(createCommand());

    expect(result.batchId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(findByProductId).toHaveBeenCalledWith(PRODUCT_ID);
    expect(save).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledTimes(1);
    expect(run.mock.invocationCallOrder[0]).toBeLessThan(
      findByProductId.mock.invocationCallOrder[0],
    );

    const saved = save.mock.calls[0][0];
    const newBatch = saved.getNewBatches()[0];

    expect(saved.getBatches()).toHaveLength(1);
    expect(newBatch.getId()).toBe(result.batchId);
    expect(newBatch.getLotNumber()).toBe('LOT-001');
    expect(newBatch.getProductId()).toBe(PRODUCT_ID);
    expect(newBatch.getQuantity()).toBe(10);
    expect(newBatch.getUnitCost()).toBe('2.50');
    expect(newBatch.getStatus()).toBe(BatchStatus.ACTIVE);
    expect(newBatch.getExpiresAt()).toEqual(EXPIRES_AT);
    expect(newBatch.getCreatedBy()).toBe(CREATED_BY);
  });

  it('adds a new batch to an existing inventory', async () => {
    const inventory = createInventory();
    const { handler, save } = setup(inventory);

    const result = await handler.execute(createCommand('LOT-002', 5));

    const saved = save.mock.calls[0][0];

    expect(saved).toBe(inventory);
    expect(saved.getBatches()).toHaveLength(2);
    expect(saved.getNewBatches()).toHaveLength(1);
    expect(saved.getNewBatches()[0].getId()).toBe(result.batchId);
    expect(saved.getNewBatches()[0].getLotNumber()).toBe('LOT-002');
  });

  it('does not save when the batch is invalid', async () => {
    const { handler, save } = setup(null);

    await expect(handler.execute(createCommand('   '))).rejects.toThrow(
      UnprocessableEntityException,
    );

    expect(save).not.toHaveBeenCalled();
  });
});

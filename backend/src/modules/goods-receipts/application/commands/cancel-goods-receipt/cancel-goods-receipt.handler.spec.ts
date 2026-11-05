import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  FindGoodsReceiptOptions,
  IGoodsReceiptsRepository,
} from '../../../domain/goods-receipts.repository';
import { GoodsReceipt } from '../../../domain/goods-receipt.aggregate';
import { GoodsReceiptLine } from '../../../domain/goods-receipt-line.entity';
import { GoodsReceiptStatus } from '../../../domain/goods-receipt-status.enum';
import { IUnitOfWork } from '../../../../../shared/application/unit-of-work';
import { CancelGoodsReceiptCommand } from './cancel-goods-receipt.command';
import { CancelGoodsReceiptHandler } from './cancel-goods-receipt.handler';

const RECEIPT_ID = 'b3d7f2a8-7a0e-4f1c-9c1a-4d3f5e6a7b8c';
const SUPPLIER_ID = '0ca741a6-ce41-4010-8148-f7b2a32aef1c';
const PRODUCT_ID = '8a2f6c1e-3b4d-4e5f-9a0b-1c2d3e4f5a6b';
const CREATED_BY = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
const CANCELLED_BY = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d';
const EXPIRES_AT = new Date('2030-01-01T00:00:00.000Z');

type FindById = (
  id: string,
  options?: FindGoodsReceiptOptions,
) => Promise<GoodsReceipt | null>;
type Update = (receipt: GoodsReceipt) => Promise<GoodsReceipt>;
type NextSequence = () => Promise<number>;
type Create = (receipt: GoodsReceipt) => Promise<GoodsReceipt>;
type Run = (work: () => Promise<unknown>) => Promise<unknown>;

const createReceipt = (): GoodsReceipt =>
  GoodsReceipt.create({
    sequence: 1,
    supplierId: SUPPLIER_ID,
    goodsReceiptLines: [
      GoodsReceiptLine.create({
        lotNumber: 'LOT-001',
        productId: PRODUCT_ID,
        quantity: 10,
        unitCost: '2.50',
        expiresAt: EXPIRES_AT,
      }),
    ],
    createdBy: CREATED_BY,
  });

const setup = (receipt: GoodsReceipt | null) => {
  const findById = jest.fn<FindById>(() => Promise.resolve(receipt));
  const update = jest.fn<Update>((value) => Promise.resolve(value));
  const create = jest.fn<Create>((value) => Promise.resolve(value));
  const nextSequence = jest.fn<NextSequence>(() => Promise.resolve(1));
  const run = jest.fn<Run>((work) => work());

  const repository: IGoodsReceiptsRepository = {
    nextSequence,
    findById,
    create,
    update,
  };
  const unitOfWork: IUnitOfWork = {
    run: run as unknown as IUnitOfWork['run'],
  };
  const handler = new CancelGoodsReceiptHandler(repository, unitOfWork);

  return { handler, findById, update, run };
};

describe('CancelGoodsReceiptHandler', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('cancels a pending receipt and records the audit fields', async () => {
    const receipt = createReceipt();
    const { handler, findById, update, run } = setup(receipt);

    const result = await handler.execute(
      new CancelGoodsReceiptCommand(RECEIPT_ID, CANCELLED_BY),
    );

    expect(result).toEqual({ id: receipt.getId() });
    expect(findById).toHaveBeenCalledWith(RECEIPT_ID, { forUpdate: true });
    expect(update).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledTimes(1);

    const cancelled = update.mock.calls[0][0];

    expect(cancelled.getStatus()).toBe(GoodsReceiptStatus.CANCELLED);
    expect(cancelled.getCancelledBy()).toBe(CANCELLED_BY);
    expect(cancelled.getCancelledAt()).toBeInstanceOf(Date);
  });

  it('rejects an unknown receipt', async () => {
    const { handler, update } = setup(null);

    await expect(
      handler.execute(new CancelGoodsReceiptCommand(RECEIPT_ID, CANCELLED_BY)),
    ).rejects.toThrow(NotFoundException);

    expect(update).not.toHaveBeenCalled();
  });

  it('rejects cancelling a confirmed receipt', async () => {
    const receipt = createReceipt();
    receipt.confirm(CREATED_BY);

    const { handler, update } = setup(receipt);

    await expect(
      handler.execute(new CancelGoodsReceiptCommand(RECEIPT_ID, CANCELLED_BY)),
    ).rejects.toThrow(ConflictException);

    expect(update).not.toHaveBeenCalled();
  });
});

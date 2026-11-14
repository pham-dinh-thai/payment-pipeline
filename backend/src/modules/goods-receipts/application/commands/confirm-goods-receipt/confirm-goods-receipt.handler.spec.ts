import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  type FindGoodsReceiptOptions,
  type IGoodsReceiptsRepository,
} from '../../../domain/goods-receipts.repository';
import { GoodsReceipt } from '../../../domain/goods-receipt.aggregate';
import { GoodsReceiptLine } from '../../../domain/goods-receipt-line.entity';
import { GoodsReceiptStatus } from '../../../domain/goods-receipt-status.enum';
import { type IUnitOfWork } from '../../../../../shared/modules/unit-of-work/unit-of-work';
import { type IOutboxRepository } from '../../../../../shared/modules/outbox/domain/outbox.repository';
import { ConfirmGoodsReceiptCommand } from './confirm-goods-receipt.command';
import { ConfirmGoodsReceiptHandler } from './confirm-goods-receipt.handler';
import {
  GOODS_RECEIPT_CONFIRMED_EVENT,
  GOODS_RECEIPT_STOCK_RECEIVED_EVENT,
} from '../../../domain/events/goods-receipt-confirmed.event';
import { EntityType } from '../../../../audit-logs/domain/enums/entity-type.enum';

const RECEIPT_ID = 'b3d7f2a8-7a0e-4f1c-9c1a-4d3f5e6a7b8c';
const SUPPLIER_ID = '0ca741a6-ce41-4010-8148-f7b2a32aef1c';
const PRODUCT_ID = '8a2f6c1e-3b4d-4e5f-9a0b-1c2d3e4f5a6b';
const OTHER_PRODUCT_ID = '11111111-1111-4111-8111-111111111111';
const CREATED_BY = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
const CONFIRMED_BY = 'f1e2d3c4-b5a6-4978-8a9b-0c1d2e3f4a5b';
const EXPIRES_AT = new Date('2030-01-01T00:00:00.000Z');
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const headers = {
  actorId: CONFIRMED_BY,
  actorType: 'user',
  actorLabel: 'admin@example.com',
  userIp: '127.0.0.1',
  userAgent: 'jest',
};

type FindById = (
  id: string,
  options?: FindGoodsReceiptOptions,
) => Promise<GoodsReceipt | null>;
type Update = (receipt: GoodsReceipt) => Promise<GoodsReceipt>;
type NextSequence = () => Promise<number>;
type Create = (receipt: GoodsReceipt) => Promise<GoodsReceipt>;
type Run = (work: () => Promise<unknown>) => Promise<unknown>;

const createLine = (
  overrides: {
    lotNumber?: string;
    productId?: string;
    quantity?: number;
  } = {},
): GoodsReceiptLine =>
  GoodsReceiptLine.create({
    lotNumber: 'LOT-001',
    productId: PRODUCT_ID,
    quantity: 10,
    unitCost: '2500',
    expiresAt: EXPIRES_AT,
    ...overrides,
  });

const createReceipt = (
  lines: GoodsReceiptLine[] = [createLine()],
): GoodsReceipt =>
  GoodsReceipt.create({
    sequence: 1,
    supplierId: SUPPLIER_ID,
    goodsReceiptLines: lines,
    createdBy: CREATED_BY,
  });

const setup = (receipt: GoodsReceipt | null) => {
  const findById = jest.fn<FindById>(() => Promise.resolve(receipt));
  const update = jest.fn<Update>((value) => Promise.resolve(value));
  const create = jest.fn<Create>((value) => Promise.resolve(value));
  const nextSequence = jest.fn<NextSequence>(() => Promise.resolve(1));
  const run = jest.fn<Run>((work) => work());
  const outboxCreate = jest
    .fn<IOutboxRepository['create']>()
    .mockResolvedValue(undefined);

  const goodsReceiptsRepository: IGoodsReceiptsRepository = {
    nextSequence,
    findById,
    create,
    update,
  };
  const unitOfWork: IUnitOfWork = {
    run: run as unknown as IUnitOfWork['run'],
  };

  const handler = new ConfirmGoodsReceiptHandler(
    goodsReceiptsRepository,
    { create: outboxCreate } as unknown as IOutboxRepository,
    unitOfWork,
  );

  return {
    handler,
    findById,
    update,
    run,
    outboxCreate,
  };
};

describe('ConfirmGoodsReceiptHandler', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('confirms the receipt, attaches batch ids and emits audit + stock events', async () => {
    const receipt = createReceipt();
    const { handler, findById, update, run, outboxCreate } = setup(receipt);

    const result = await handler.execute(
      new ConfirmGoodsReceiptCommand(RECEIPT_ID, CONFIRMED_BY, headers),
    );

    expect(result).toEqual({ id: receipt.getId() });
    expect(run).toHaveBeenCalledTimes(1);
    expect(findById).toHaveBeenCalledWith(RECEIPT_ID, { forUpdate: true });
    expect(receipt.getStatus()).toBe(GoodsReceiptStatus.CONFIRMED);
    expect(receipt.getConfirmedBy()).toBe(CONFIRMED_BY);
    expect(update).toHaveBeenCalledWith(receipt);

    const line = receipt.getGoodsReceiptLines()[0];

    expect(line.getBatchId()).toMatch(UUID_V4_REGEX);

    expect(outboxCreate).toHaveBeenCalledTimes(2);
    expect(outboxCreate).toHaveBeenNthCalledWith(1, {
      eventType: GOODS_RECEIPT_CONFIRMED_EVENT,
      payload: {
        headers,
        audit: {
          entityType: EntityType.GOODS_RECEIPTS,
          entityId: receipt.getId(),
          before: { status: GoodsReceiptStatus.PENDING },
          after: {
            code: receipt.getCode(),
            supplierId: SUPPLIER_ID,
            status: GoodsReceiptStatus.CONFIRMED,
            createdBy: CREATED_BY,
            confirmedBy: CONFIRMED_BY,
            confirmedAt: receipt.getConfirmedAt()?.toISOString(),
            cancelledBy: null,
            cancelledAt: null,
            lines: receipt.getGoodsReceiptLines().map((item) => ({
              id: item.getId(),
              lotNumber: item.getLotNumber(),
              productId: item.getProductId(),
              quantity: item.getQuantity(),
              unitCost: item.getUnitCost(),
              expiresAt: item.getExpiresAt().toISOString(),
              batchId: item.getBatchId(),
            })),
          },
        },
      },
    });
    expect(outboxCreate).toHaveBeenNthCalledWith(2, {
      eventType: GOODS_RECEIPT_STOCK_RECEIVED_EVENT,
      payload: {
        goodsReceiptId: receipt.getId(),
        confirmedBy: CONFIRMED_BY,
        lines: [
          {
            batchId: line.getBatchId(),
            productId: PRODUCT_ID,
            lotNumber: 'LOT-001',
            quantity: 10,
            unitCost: '2500',
            expiresAt: EXPIRES_AT.toISOString(),
          },
        ],
      },
    });
  });

  it('emits one stock line per receipt line with distinct batch ids', async () => {
    const receipt = createReceipt([
      createLine({ lotNumber: 'LOT-001' }),
      createLine({ lotNumber: 'LOT-002' }),
      createLine({ lotNumber: 'LOT-003', productId: OTHER_PRODUCT_ID }),
    ]);
    const { handler, outboxCreate } = setup(receipt);

    await handler.execute(
      new ConfirmGoodsReceiptCommand(RECEIPT_ID, CONFIRMED_BY, headers),
    );

    const stockEvent = outboxCreate.mock.calls[1][0];
    const payload = stockEvent.payload as {
      lines: Array<{ batchId: string; lotNumber: string; productId: string }>;
    };

    expect(payload.lines).toHaveLength(3);
    expect(payload.lines.map((line) => line.lotNumber)).toEqual([
      'LOT-001',
      'LOT-002',
      'LOT-003',
    ]);
    expect(payload.lines[2].productId).toBe(OTHER_PRODUCT_ID);
    expect(new Set(payload.lines.map((line) => line.batchId)).size).toBe(3);
    expect(payload.lines.map((line) => line.batchId)).toEqual(
      receipt.getGoodsReceiptLines().map((line) => line.getBatchId()),
    );
  });

  it('rejects an unknown receipt', async () => {
    const { handler, update, outboxCreate } = setup(null);

    await expect(
      handler.execute(
        new ConfirmGoodsReceiptCommand(RECEIPT_ID, CONFIRMED_BY, headers),
      ),
    ).rejects.toThrow(NotFoundException);

    expect(update).not.toHaveBeenCalled();
    expect(outboxCreate).not.toHaveBeenCalled();
  });

  it('rejects confirming a receipt that is not pending', async () => {
    const receipt = createReceipt();

    receipt.confirm(CREATED_BY);

    const { handler, update, outboxCreate } = setup(receipt);

    await expect(
      handler.execute(
        new ConfirmGoodsReceiptCommand(RECEIPT_ID, CONFIRMED_BY, headers),
      ),
    ).rejects.toThrow(ConflictException);

    expect(update).not.toHaveBeenCalled();
    expect(outboxCreate).not.toHaveBeenCalled();
  });
});

import { describe, expect, it, jest } from '@jest/globals';
import { UnprocessableEntityException } from '@nestjs/common';
import {
  FindGoodsReceiptOptions,
  IGoodsReceiptsRepository,
} from '../../../domain/goods-receipts.repository';
import { GoodsReceipt } from '../../../domain/goods-receipt.aggregate';
import { GoodsReceiptStatus } from '../../../domain/goods-receipt-status.enum';
import { IUnitOfWork } from '../../../../../shared/modules/unit-of-work/unit-of-work';
import {
  CreateGoodsReceiptCommand,
  CreateGoodsReceiptLineProps,
} from './create-goods-receipt.command';
import { CreateGoodsReceiptHandler } from './create-goods-receipt.handler';

const SUPPLIER_ID = 'b3d7f2a8-7a0e-4f1c-9c1a-4d3f5e6a7b8c';
const PRODUCT_ID = '0ca741a6-ce41-4010-8148-f7b2a32aef1c';
const OTHER_PRODUCT_ID = '8a2f6c1e-3b4d-4e5f-9a0b-1c2d3e4f5a6b';
const CREATED_BY = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
const EXPIRES_AT = new Date('2030-01-01T00:00:00.000Z');

type NextSequence = () => Promise<number>;
type FindById = (
  id: string,
  options?: FindGoodsReceiptOptions,
) => Promise<GoodsReceipt | null>;
type Create = (receipt: GoodsReceipt) => Promise<GoodsReceipt>;
type Update = (receipt: GoodsReceipt) => Promise<GoodsReceipt>;
type Run = (work: () => Promise<unknown>) => Promise<unknown>;

const buildLine = (
  overrides: Partial<CreateGoodsReceiptLineProps> = {},
): CreateGoodsReceiptLineProps => ({
  lotNumber: 'LOT-001',
  productId: PRODUCT_ID,
  quantity: 10,
  unitCost: '2.50',
  expiresAt: EXPIRES_AT,
  ...overrides,
});

const createCommand = (
  lines: CreateGoodsReceiptLineProps[] = [buildLine()],
): CreateGoodsReceiptCommand =>
  new CreateGoodsReceiptCommand(SUPPLIER_ID, lines, CREATED_BY);

const setup = (sequence = 1) => {
  const nextSequence = jest.fn<NextSequence>(() => Promise.resolve(sequence));
  const findById = jest.fn<FindById>(() => Promise.resolve(null));
  const create = jest.fn<Create>((receipt) => Promise.resolve(receipt));
  const update = jest.fn<Update>((receipt) => Promise.resolve(receipt));
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
  const handler = new CreateGoodsReceiptHandler(repository, unitOfWork);

  return { handler, nextSequence, create, run };
};

describe('CreateGoodsReceiptHandler', () => {
  it('creates a pending receipt with a sequence-based code inside a unit of work', async () => {
    const { handler, nextSequence, create, run } = setup(7);

    const result = await handler.execute(createCommand());

    expect(result).toMatchObject({ code: 'GR-0007' });
    expect(result.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(nextSequence).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledTimes(1);
    expect(run.mock.invocationCallOrder[0]).toBeLessThan(
      nextSequence.mock.invocationCallOrder[0],
    );

    const created = create.mock.calls[0][0];

    expect(created.getId()).toBe(result.id);
    expect(created.getCode()).toBe('GR-0007');
    expect(created.getSupplierId()).toBe(SUPPLIER_ID);
    expect(created.getCreatedBy()).toBe(CREATED_BY);
    expect(created.getStatus()).toBe(GoodsReceiptStatus.PENDING);
    expect(created.getGoodsReceiptLines()).toHaveLength(1);
  });

  it('normalizes lot numbers and keeps one line per product and lot', async () => {
    const { handler, create } = setup(2);

    await handler.execute(
      createCommand([
        buildLine({ lotNumber: '  LOT-001  ' }),
        buildLine({ productId: OTHER_PRODUCT_ID }),
      ]),
    );

    const created = create.mock.calls[0][0];
    const lines = created.getGoodsReceiptLines();

    expect(lines).toHaveLength(2);
    expect(lines[0].getLotNumber()).toBe('LOT-001');
    expect(lines[0].getProductId()).toBe(PRODUCT_ID);
    expect(lines[1].getProductId()).toBe(OTHER_PRODUCT_ID);
  });

  it('rejects duplicated product and lot before saving', async () => {
    const { handler, create } = setup();

    await expect(
      handler.execute(createCommand([buildLine(), buildLine()])),
    ).rejects.toThrow(UnprocessableEntityException);

    expect(create).not.toHaveBeenCalled();
  });

  it('rejects a receipt without lines before saving', async () => {
    const { handler, create } = setup();

    await expect(handler.execute(createCommand([]))).rejects.toThrow(
      'Goods receipt must have at least one line',
    );

    expect(create).not.toHaveBeenCalled();
  });
});

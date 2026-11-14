import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { GoodsReceiptLine } from './goods-receipt-line.entity';
import { GoodsReceipt } from './goods-receipt.aggregate';
import { GoodsReceiptStatus } from './goods-receipt-status.enum';

const SUPPLIER_ID = 'b3d7f2a8-7a0e-4f1c-9c1a-4d3f5e6a7b8c';
const OTHER_PRODUCT_ID = '0ca741a6-ce41-4010-8148-f7b2a32aef1c';
const BATCH_ID = '8a2f6c1e-3b4d-4e5f-9a0b-1c2d3e4f5a6b';
const CREATED_BY = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
const CONFIRMED_BY = 'f1e2d3c4-b5a6-4978-8a9b-0c1d2e3f4a5b';
const CANCELLED_BY = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d';
const EXPIRES_AT = new Date('2030-01-01T00:00:00.000Z');

const createLine = (
  overrides: {
    lotNumber?: string;
    productId?: string;
    quantity?: number;
  } = {},
): GoodsReceiptLine =>
  GoodsReceiptLine.create({
    lotNumber: 'LOT-001',
    productId: SUPPLIER_ID,
    unitCost: '2500',
    quantity: 10,
    expiresAt: EXPIRES_AT,
    ...overrides,
  });

const createReceipt = (
  goodsReceiptLines: GoodsReceiptLine[] = [createLine()],
): GoodsReceipt =>
  GoodsReceipt.create({
    sequence: 1,
    supplierId: SUPPLIER_ID,
    goodsReceiptLines,
    createdBy: CREATED_BY,
  });

describe('GoodsReceipt', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  describe('create', () => {
    it('creates a pending receipt with generated id', () => {
      const receipt = createReceipt();

      expect(receipt.getId()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(receipt.getCode()).toBe('GR-0001');
      expect(receipt.getSupplierId()).toBe(SUPPLIER_ID);
      expect(receipt.getStatus()).toBe(GoodsReceiptStatus.PENDING);
      expect(receipt.getCreatedBy()).toBe(CREATED_BY);
      expect(receipt.getConfirmedBy()).toBeNull();
      expect(receipt.getConfirmedAt()).toBeNull();
      expect(receipt.getCancelledBy()).toBeNull();
      expect(receipt.getCancelledAt()).toBeNull();
      expect(receipt.getGoodsReceiptLines()).toHaveLength(1);
    });

    it('sets createdAt equal to updatedAt on creation', () => {
      const receipt = createReceipt();

      expect(receipt.getCreatedAt()).toEqual(receipt.getUpdatedAt());
    });

    it('rejects a receipt without lines', () => {
      expect(() => createReceipt([])).toThrow(
        'Goods receipt must have at least one line',
      );
    });

    it('rejects duplicated product and lot in the same receipt', () => {
      expect(() => createReceipt([createLine(), createLine()])).toThrow(
        UnprocessableEntityException,
      );
    });

    it('allows the same lot for different products', () => {
      const receipt = createReceipt([
        createLine(),
        createLine({ productId: OTHER_PRODUCT_ID }),
      ]);

      expect(receipt.getGoodsReceiptLines()).toHaveLength(2);
    });

    it('allows different lots for the same product', () => {
      const receipt = createReceipt([
        createLine(),
        createLine({ lotNumber: 'LOT-002' }),
      ]);

      expect(receipt.getGoodsReceiptLines()).toHaveLength(2);
    });

    it('does not expose the internal lines array', () => {
      const receipt = createReceipt();
      const lines = receipt.getGoodsReceiptLines();

      lines.push(createLine({ lotNumber: 'LOT-002' }));

      expect(receipt.getGoodsReceiptLines()).toHaveLength(1);
    });
  });

  describe('fromPersistent', () => {
    it('restores a receipt with status and lines', () => {
      const createdAt = new Date('2026-01-01T00:00:00.000Z');
      const updatedAt = new Date('2026-01-02T00:00:00.000Z');
      const confirmedAt = new Date('2026-01-02T00:00:00.000Z');
      const line = createLine();

      const receipt = GoodsReceipt.fromPersistent({
        id: SUPPLIER_ID,
        code: 'GR-0002',
        supplierId: SUPPLIER_ID,
        goodsReceiptLines: [line],
        status: GoodsReceiptStatus.CONFIRMED,
        createdBy: CREATED_BY,
        confirmedBy: CONFIRMED_BY,
        confirmedAt,
        cancelledBy: null,
        cancelledAt: null,
        createdAt,
        updatedAt,
      });

      expect(receipt.getId()).toBe(SUPPLIER_ID);
      expect(receipt.getStatus()).toBe(GoodsReceiptStatus.CONFIRMED);
      expect(receipt.getConfirmedBy()).toBe(CONFIRMED_BY);
      expect(receipt.getConfirmedAt()).toEqual(confirmedAt);
      expect(receipt.getCancelledBy()).toBeNull();
      expect(receipt.getCancelledAt()).toBeNull();
      expect(receipt.getGoodsReceiptLines()).toHaveLength(1);
      expect(receipt.getCreatedAt()).toEqual(createdAt);
      expect(receipt.getUpdatedAt()).toEqual(updatedAt);
    });
  });

  describe('attachBatch', () => {
    it('attaches the batch to the matching line and updates updatedAt', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

      const line = createLine();
      const receipt = createReceipt([line]);
      const createdAt = receipt.getCreatedAt();

      jest.setSystemTime(new Date('2026-01-01T00:00:01.000Z'));
      receipt.attachBatch(line.getId(), BATCH_ID);

      expect(line.getBatchId()).toBe(BATCH_ID);
      expect(receipt.getUpdatedAt().getTime()).toBeGreaterThan(
        createdAt.getTime(),
      );
    });

    it('rejects an unknown line', () => {
      const receipt = createReceipt();

      expect(() =>
        receipt.attachBatch('11111111-1111-4111-8111-111111111111', BATCH_ID),
      ).toThrow(NotFoundException);
    });
  });

  describe('confirm', () => {
    it('confirms a pending receipt and records audit fields', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

      const receipt = createReceipt();
      const createdAt = receipt.getCreatedAt();

      jest.setSystemTime(new Date('2026-01-01T00:00:01.000Z'));
      receipt.confirm(CONFIRMED_BY);

      expect(receipt.getStatus()).toBe(GoodsReceiptStatus.CONFIRMED);
      expect(receipt.getConfirmedBy()).toBe(CONFIRMED_BY);
      expect(receipt.getConfirmedAt()).toEqual(
        new Date('2026-01-01T00:00:01.000Z'),
      );
      expect(receipt.getCancelledBy()).toBeNull();
      expect(receipt.getCancelledAt()).toBeNull();
      expect(receipt.getUpdatedAt().getTime()).toBeGreaterThan(
        createdAt.getTime(),
      );
    });

    it('rejects confirming twice', () => {
      const receipt = createReceipt();
      receipt.confirm(CONFIRMED_BY);

      expect(() => receipt.confirm(CONFIRMED_BY)).toThrow(ConflictException);
    });

    it('rejects confirming a cancelled receipt', () => {
      const receipt = createReceipt();
      receipt.cancel(CANCELLED_BY);

      expect(() => receipt.confirm(CONFIRMED_BY)).toThrow(ConflictException);
    });
  });

  describe('cancel', () => {
    it('cancels a pending receipt and records audit fields', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

      const receipt = createReceipt();
      const createdAt = receipt.getCreatedAt();

      jest.setSystemTime(new Date('2026-01-01T00:00:01.000Z'));
      receipt.cancel(CANCELLED_BY);

      expect(receipt.getStatus()).toBe(GoodsReceiptStatus.CANCELLED);
      expect(receipt.getCancelledBy()).toBe(CANCELLED_BY);
      expect(receipt.getCancelledAt()).toEqual(
        new Date('2026-01-01T00:00:01.000Z'),
      );
      expect(receipt.getConfirmedBy()).toBeNull();
      expect(receipt.getConfirmedAt()).toBeNull();
      expect(receipt.getUpdatedAt().getTime()).toBeGreaterThan(
        createdAt.getTime(),
      );
    });

    it('rejects cancelling a confirmed receipt', () => {
      const receipt = createReceipt();
      receipt.confirm(CONFIRMED_BY);

      expect(() => receipt.cancel(CANCELLED_BY)).toThrow(ConflictException);
    });

    it('rejects cancelling twice', () => {
      const receipt = createReceipt();
      receipt.cancel(CANCELLED_BY);

      expect(() => receipt.cancel(CANCELLED_BY)).toThrow(ConflictException);
    });
  });
});

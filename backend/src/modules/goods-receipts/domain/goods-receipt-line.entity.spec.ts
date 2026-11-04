import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  CreateGoodsReceiptLineProps,
  GoodsReceiptLine,
} from './goods-receipt-line.entity';

const PRODUCT_ID = 'b3d7f2a8-7a0e-4f1c-9c1a-4d3f5e6a7b8c';
const BATCH_ID = '0ca741a6-ce41-4010-8148-f7b2a32aef1c';
const EXPIRES_AT = new Date('2030-01-01T00:00:00.000Z');

const createLine = (
  overrides: Partial<CreateGoodsReceiptLineProps> = {},
): GoodsReceiptLine =>
  GoodsReceiptLine.create({
    lotNumber: 'LOT-001',
    productId: PRODUCT_ID,
    unitCost: '2.50',
    quantity: 10,
    expiresAt: EXPIRES_AT,
    ...overrides,
  });

describe('GoodsReceiptLine', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  describe('create', () => {
    it('creates a line with generated id and normalized values', () => {
      const line = createLine({
        lotNumber: '  LOT-001  ',
        productId: `  ${PRODUCT_ID}  `,
      });

      expect(line.getId()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(line.getLotNumber()).toBe('LOT-001');
      expect(line.getProductId()).toBe(PRODUCT_ID);
      expect(line.getQuantity()).toBe(10);
      expect(line.getUnitCost()).toBe('2.50');
      expect(line.getExpiresAt()).toEqual(EXPIRES_AT);
      expect(line.getBatchId()).toBeNull();
    });

    it('sets createdAt equal to updatedAt on creation', () => {
      const line = createLine();

      expect(line.getCreatedAt()).toEqual(line.getUpdatedAt());
    });

    it.each(['', '   ', null, undefined])(
      'rejects empty lot number %p',
      (lotNumber) => {
        expect(() =>
          createLine({ lotNumber: lotNumber as unknown as string }),
        ).toThrow(UnprocessableEntityException);
      },
    );

    it('rejects a lot number longer than 50 characters', () => {
      expect(() => createLine({ lotNumber: 'L'.repeat(51) })).toThrow(
        'Lot number must have at most 50 characters',
      );
    });

    it.each(['', '   ', null, undefined])(
      'rejects empty product id %p',
      (productId) => {
        expect(() =>
          createLine({ productId: productId as unknown as string }),
        ).toThrow('Product id is required');
      },
    );

    it('rejects a quantity of zero', () => {
      expect(() => createLine({ quantity: 0 })).toThrow(
        'Goods receipt line quantity must be greater than 0',
      );
    });

    it.each([-1, 1.5, NaN, Infinity])(
      'rejects invalid quantity %s',
      (quantity) => {
        expect(() => createLine({ quantity })).toThrow(
          UnprocessableEntityException,
        );
      },
    );

    it('rejects an invalid unit cost', () => {
      expect(() => createLine({ unitCost: '-1' })).toThrow(
        UnprocessableEntityException,
      );
    });

    it('rejects an invalid expiresAt', () => {
      expect(() => createLine({ expiresAt: new Date('not-a-date') })).toThrow(
        'Expires at must be a valid date',
      );
    });
  });

  describe('fromPersistent', () => {
    it('restores a line from persisted data', () => {
      const createdAt = new Date('2026-01-01T00:00:00.000Z');
      const updatedAt = new Date('2026-01-02T00:00:00.000Z');

      const line = GoodsReceiptLine.fromPersistent({
        id: PRODUCT_ID,
        lotNumber: 'LOT-002',
        productId: PRODUCT_ID,
        unitCost: '5.00',
        quantity: 7,
        expiresAt: EXPIRES_AT,
        batchId: BATCH_ID,
        createdAt,
        updatedAt,
      });

      expect(line.getId()).toBe(PRODUCT_ID);
      expect(line.getLotNumber()).toBe('LOT-002');
      expect(line.getProductId()).toBe(PRODUCT_ID);
      expect(line.getUnitCost()).toBe('5.00');
      expect(line.getQuantity()).toBe(7);
      expect(line.getExpiresAt()).toEqual(EXPIRES_AT);
      expect(line.getBatchId()).toBe(BATCH_ID);
      expect(line.getCreatedAt()).toEqual(createdAt);
      expect(line.getUpdatedAt()).toEqual(updatedAt);
    });
  });

  describe('attachBatch', () => {
    it('attaches the batch and updates updatedAt', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

      const line = createLine();
      const createdAt = line.getCreatedAt();

      jest.setSystemTime(new Date('2026-01-01T00:00:01.000Z'));
      line.attachBatch(BATCH_ID);

      expect(line.getBatchId()).toBe(BATCH_ID);
      expect(line.getUpdatedAt().getTime()).toBeGreaterThan(
        createdAt.getTime(),
      );
    });

    it('rejects attaching a second batch', () => {
      const line = createLine();
      line.attachBatch(BATCH_ID);

      expect(() => line.attachBatch(BATCH_ID)).toThrow(ConflictException);
      expect(line.getBatchId()).toBe(BATCH_ID);
    });
  });

  describe('getTotalCost', () => {
    it('returns unit cost multiplied by quantity', () => {
      const line = createLine({ quantity: 10, unitCost: '2.50' });

      expect(line.getTotalCost()).toBe('25.00');
    });
  });
});

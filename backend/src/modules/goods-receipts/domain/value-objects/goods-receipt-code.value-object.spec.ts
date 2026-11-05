import { describe, expect, it } from '@jest/globals';
import { UnprocessableEntityException } from '@nestjs/common';
import { GoodsReceiptCode } from './goods-receipt-code.value-object';

describe('GoodsReceiptCode', () => {
  describe('fromNumber', () => {
    it.each([
      [1, 'GR-0001'],
      [42, 'GR-0042'],
      [9999, 'GR-9999'],
      [12345, 'GR-12345'],
    ])('formats sequence %s as %s', (sequence, expected) => {
      expect(GoodsReceiptCode.fromNumber(sequence).getValue()).toBe(expected);
    });

    it.each([0, -1, 1.5, NaN, Infinity])(
      'rejects invalid sequence %s',
      (sequence) => {
        expect(() => GoodsReceiptCode.fromNumber(sequence)).toThrow(
          UnprocessableEntityException,
        );
      },
    );
  });

  describe('create', () => {
    it('restores a persisted code and trims it', () => {
      expect(GoodsReceiptCode.create('  GR-0007  ').getValue()).toBe('GR-0007');
    });

    it.each(['', 'GR-', 'GR-ABC', 'SUP-0001', null, undefined, 7])(
      'rejects invalid code %p',
      (code) => {
        expect(() => GoodsReceiptCode.create(code)).toThrow(
          UnprocessableEntityException,
        );
      },
    );
  });

  describe('equals', () => {
    it('compares by value', () => {
      const code = GoodsReceiptCode.fromNumber(7);

      expect(code.equals(GoodsReceiptCode.create('GR-0007'))).toBe(true);
      expect(code.equals(GoodsReceiptCode.fromNumber(8))).toBe(false);
    });
  });
});

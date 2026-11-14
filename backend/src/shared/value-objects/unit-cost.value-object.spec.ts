import { describe, expect, it } from '@jest/globals';
import { UnprocessableEntityException } from '@nestjs/common';
import { UnitCost } from './unit-cost.value-object';

describe('UnitCost', () => {
  describe('create', () => {
    it.each(['0', '12500', '999999999999999'])('accepts %s', (value) => {
      expect(UnitCost.create(value).toString()).toBe(value);
    });

    it.each([
      '-1',
      '-0.01',
      '12.5',
      '1.234',
      'Infinity',
      'NaN',
      'not-a-number',
    ])('rejects %s', (value) => {
      expect(() => UnitCost.create(value)).toThrow(
        UnprocessableEntityException,
      );
    });

    it('rejects value greater than or equal to 10^15', () => {
      expect(() => UnitCost.create('1000000000000000')).toThrow(
        'Amount is too large (max value: 10^15)',
      );
    });
  });

  describe('toString', () => {
    it('normalizes leading zeros', () => {
      expect(UnitCost.create('0012500').toString()).toBe('12500');
    });
  });

  describe('equals', () => {
    it('compares numeric values', () => {
      expect(UnitCost.create('12500').equals(UnitCost.create('012500'))).toBe(
        true,
      );
      expect(UnitCost.create('12500').equals(UnitCost.create('12501'))).toBe(
        false,
      );
    });
  });

  describe('getTotal', () => {
    it('multiplies by quantity as an integer', () => {
      expect(UnitCost.create('2500').getTotal(4)).toBe('10000');
    });

    it('returns zero when quantity is zero', () => {
      expect(UnitCost.create('2500').getTotal(0)).toBe('0');
    });
  });
});

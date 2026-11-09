import { describe, expect, it } from '@jest/globals';
import { UnprocessableEntityException } from '@nestjs/common';
import { UnitCost } from './unit-cost.value-object';

describe('UnitCost', () => {
  describe('create', () => {
    it.each(['0', '12.5', '12.50', '9999999999.99'])('accepts %s', (value) => {
      expect(UnitCost.create(value).toString()).toBe(Number(value).toFixed(2));
    });

    it.each(['-1', '-0.01', '12.345', 'Infinity', 'NaN', 'not-a-number'])(
      'rejects %s',
      (value) => {
        expect(() => UnitCost.create(value)).toThrow(
          UnprocessableEntityException,
        );
      },
    );

    it('rejects value greater than or equal to 10^10', () => {
      expect(() => UnitCost.create('10000000000')).toThrow(
        'Unit price is too large (max value: 10^10)',
      );
    });
  });

  describe('toString', () => {
    it('normalizes to two decimal places', () => {
      expect(UnitCost.create('12.5').toString()).toBe('12.50');
    });
  });

  describe('equals', () => {
    it('compares numeric values', () => {
      expect(UnitCost.create('12.50').equals(UnitCost.create('12.5'))).toBe(
        true,
      );
      expect(UnitCost.create('12.50').equals(UnitCost.create('12.51'))).toBe(
        false,
      );
    });
  });

  describe('getTotal', () => {
    it('multiplies by quantity with two decimal places', () => {
      expect(UnitCost.create('2.50').getTotal(4)).toBe('10.00');
    });

    it('returns zero when quantity is zero', () => {
      expect(UnitCost.create('2.50').getTotal(0)).toBe('0.00');
    });
  });
});

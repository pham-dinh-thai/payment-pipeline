import { UnprocessableEntityException } from '@nestjs/common';
import { Money } from './money.value-object';

describe('Money', () => {
  describe('create', () => {
    it.each(['0', '1', '12500', '999999999999999', 42, 42n])(
      'accepts %s',
      (value) => {
        expect(Money.create(value).toString()).toBe(String(value));
      },
    );

    it('normalizes leading zeros', () => {
      expect(Money.create('0012500').toString()).toBe('12500');
    });

    it.each(['-1', '-0.01', '12.5', '1.234', 'Infinity', 'NaN', '', 'abc'])(
      'rejects %s',
      (value) => {
        expect(() => Money.create(value)).toThrow(UnprocessableEntityException);
      },
    );

    it('rejects a non-integer number', () => {
      expect(() => Money.create(12.5)).toThrow(
        'Amount must be an integer in VND',
      );
    });

    it('rejects negative values', () => {
      expect(() => Money.create('-1')).toThrow('can not be less than 0');
    });

    it('rejects value greater than or equal to 10^15', () => {
      expect(() => Money.create('1000000000000000')).toThrow(
        'Amount is too large (max value: 10^15)',
      );
    });
  });

  describe('add', () => {
    it('adds two amounts', () => {
      expect(Money.create('2500').add(Money.create('1500')).toString()).toBe(
        '4000',
      );
    });
  });

  describe('multiply', () => {
    it('multiplies by a non-negative integer', () => {
      expect(Money.create('2500').multiply(4).toString()).toBe('10000');
    });

    it('multiplies by zero', () => {
      expect(Money.create('2500').multiply(0).toString()).toBe('0');
    });

    it.each([-1, 1.5])('rejects a factor of %s', (factor) => {
      expect(() => Money.create('2500').multiply(factor)).toThrow(
        'Amount multiplier must be a non-negative integer',
      );
    });
  });

  describe('equals', () => {
    it('compares values', () => {
      expect(Money.create('12500').equals(Money.create('012500'))).toBe(true);
      expect(Money.create('12500').equals(Money.create('12501'))).toBe(false);
    });
  });
});

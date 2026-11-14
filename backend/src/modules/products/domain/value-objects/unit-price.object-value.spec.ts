import { describe, expect, it } from '@jest/globals';
import { UnprocessableEntityException } from '@nestjs/common';
import { UnitPrice } from './unit-price.object-value';

describe('UnitPrice', () => {
  it('normalizes a valid value to an integer', () => {
    expect(UnitPrice.create('12500').toString()).toBe('12500');
    expect(UnitPrice.create('0').toString()).toBe('0');
  });

  it('compares values by numeric value', () => {
    expect(UnitPrice.create('12500').equals(UnitPrice.create('012500'))).toBe(
      true,
    );
    expect(UnitPrice.create('12500').equals(UnitPrice.create('13000'))).toBe(
      false,
    );
  });

  it.each([
    ['not-a-number', 'not an integer'],
    ['-100', 'can not be less than 0'],
    ['12.5', 'not an integer'],
    ['1000000000000000', 'too large'],
  ])('rejects %s', (raw, message) => {
    expect(() => UnitPrice.create(raw)).toThrow(UnprocessableEntityException);
    expect(() => UnitPrice.create(raw)).toThrow(message);
  });
});

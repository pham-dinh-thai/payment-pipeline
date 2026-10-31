import { describe, expect, it } from '@jest/globals';
import { UnprocessableEntityException } from '@nestjs/common';
import { UnitPrice } from './unit-price.object-value';

describe('UnitPrice', () => {
  it('normalizes a valid value to 2 decimal places', () => {
    expect(UnitPrice.create('12.5').toString()).toBe('12.50');
    expect(UnitPrice.create('0').toString()).toBe('0.00');
  });

  it('compares values by numeric value', () => {
    expect(UnitPrice.create('12.50').equals(UnitPrice.create('12.5'))).toBe(
      true,
    );
    expect(UnitPrice.create('12.50').equals(UnitPrice.create('13.00'))).toBe(
      false,
    );
  });

  it.each([
    ['not-a-number', 'Invalid unit price'],
    ['-1.00', 'can not be less than 0'],
    ['1.234', 'at most 2 decimal places'],
    ['10000000000.00', 'too large'],
  ])('rejects %s', (raw, message) => {
    expect(() => UnitPrice.create(raw)).toThrow(UnprocessableEntityException);
    expect(() => UnitPrice.create(raw)).toThrow(message);
  });
});

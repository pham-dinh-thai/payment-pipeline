import { describe, expect, it } from '@jest/globals';
import { UnprocessableEntityException } from '@nestjs/common';
import { LotNumber } from './lot-number.value-object';

describe('LotNumber', () => {
  it('trims whitespace', () => {
    expect(LotNumber.create('  LOT-001  ').getValue()).toBe('LOT-001');
  });

  it.each(['', '   ', null, undefined])('rejects empty value %p', (value) => {
    expect(() => LotNumber.create(value as unknown as string)).toThrow(
      UnprocessableEntityException,
    );
  });

  it('accepts a value with 50 characters', () => {
    const value = 'L'.repeat(50);

    expect(LotNumber.create(value).getValue()).toBe(value);
  });

  it('rejects a value longer than 50 characters', () => {
    expect(() => LotNumber.create('L'.repeat(51))).toThrow(
      'Lot number is too long',
    );
  });
});

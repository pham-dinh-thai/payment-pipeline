import { describe, expect, it } from '@jest/globals';
import { UnprocessableEntityException } from '@nestjs/common';
import { Quantity } from './quantity.value-object';

describe('Quantity', () => {
  it.each([0, 1, 10, 999])('accepts %s', (value) => {
    expect(Quantity.create(value).getValue()).toBe(value);
  });

  it.each([-1, -100, 1.5, NaN, Infinity])('rejects %s', (value) => {
    expect(() => Quantity.create(value)).toThrow(UnprocessableEntityException);
  });
});

import { describe, expect, it } from '@jest/globals';
import { UnprocessableEntityException } from '@nestjs/common';
import { Quantity } from './quantity.value-object';

describe('Quantity', () => {
  describe('create', () => {
    it.each([0, 1, 10, 999])('accepts %s', (value) => {
      expect(Quantity.create(value).getValue()).toBe(value);
    });

    it.each([-1, -100, 1.5, NaN, Infinity, -Infinity])(
      'rejects %s',
      (value) => {
        expect(() => Quantity.create(value)).toThrow(
          UnprocessableEntityException,
        );
      },
    );
  });

  describe('add', () => {
    it('adds the quantity', () => {
      expect(Quantity.create(10).add(5).getValue()).toBe(15);
    });

    it('does not mutate the original value', () => {
      const quantity = Quantity.create(10);

      quantity.add(5);

      expect(quantity.getValue()).toBe(10);
    });
  });

  describe('subtract', () => {
    it('subtracts the quantity', () => {
      expect(Quantity.create(10).subtract(4).getValue()).toBe(6);
    });

    it('allows subtracting down to zero', () => {
      expect(Quantity.create(10).subtract(10).getValue()).toBe(0);
    });

    it('rejects a result below zero', () => {
      const quantity = Quantity.create(10);

      expect(() => quantity.subtract(11)).toThrow(UnprocessableEntityException);
      expect(quantity.getValue()).toBe(10);
    });
  });

  describe('isZero', () => {
    it('is true only for zero', () => {
      expect(Quantity.create(0).isZero()).toBe(true);
      expect(Quantity.create(1).isZero()).toBe(false);
    });
  });

  describe('equals', () => {
    it('compares values', () => {
      expect(Quantity.create(5).equals(Quantity.create(5))).toBe(true);
      expect(Quantity.create(5).equals(Quantity.create(6))).toBe(false);
    });
  });
});

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

  describe('assertPositive', () => {
    it.each([1, 10, 999])('accepts %s', (value) => {
      expect(() =>
        Quantity.assertPositive(value, 'Receive quantity'),
      ).not.toThrow();
    });

    it.each([0, -1, 1.5, NaN, Infinity])('rejects %s', (value) => {
      expect(() => Quantity.assertPositive(value, 'Receive quantity')).toThrow(
        UnprocessableEntityException,
      );
    });

    it('uses the label in the error message', () => {
      expect(() => Quantity.assertPositive(0, 'Issue quantity')).toThrow(
        'Issue quantity must be a positive integer',
      );
    });
  });

  describe('increase', () => {
    it('adds the quantity', () => {
      expect(Quantity.create(10).increase(5).getValue()).toBe(15);
    });

    it('does not mutate the original value', () => {
      const quantity = Quantity.create(10);

      quantity.increase(5);

      expect(quantity.getValue()).toBe(10);
    });
  });

  describe('decrease', () => {
    it('subtracts the quantity', () => {
      expect(Quantity.create(10).decrease(4).getValue()).toBe(6);
    });

    it('allows decreasing to zero', () => {
      expect(Quantity.create(10).decrease(10).getValue()).toBe(0);
    });

    it('rejects when requested quantity is greater than available', () => {
      const quantity = Quantity.create(10);

      expect(() => quantity.decrease(11)).toThrow(UnprocessableEntityException);
      expect(() => quantity.decrease(11)).toThrow(
        'Not enough stock: available 10, requested 11',
      );
      expect(quantity.getValue()).toBe(10);
    });
  });
});

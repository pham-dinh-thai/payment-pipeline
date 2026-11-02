import { describe, expect, it } from '@jest/globals';
import { UnprocessableEntityException } from '@nestjs/common';
import { SupplierName } from './supplier-name.value-object';

describe('SupplierName', () => {
  it('trims whitespace', () => {
    expect(SupplierName.create('  Công ty TNHH ABC  ').getValue()).toBe(
      'Công ty TNHH ABC',
    );
  });

  it.each(['', '   ', null, undefined])('rejects empty value %p', (value) => {
    expect(() => SupplierName.create(value as unknown as string)).toThrow(
      UnprocessableEntityException,
    );
  });

  it('accepts a value with 255 characters', () => {
    const value = 'N'.repeat(255);

    expect(SupplierName.create(value).getValue()).toBe(value);
  });

  it('rejects a value longer than 255 characters', () => {
    expect(() => SupplierName.create('N'.repeat(256))).toThrow(
      'Supplier name is too long',
    );
  });
});

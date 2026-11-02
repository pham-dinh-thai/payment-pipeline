import { describe, expect, it } from '@jest/globals';
import { UnprocessableEntityException } from '@nestjs/common';
import { SupplierCode } from './supplier-code.value-object';

describe('SupplierCode', () => {
  it('trims whitespace', () => {
    expect(SupplierCode.create('  NCC-001  ').getValue()).toBe('NCC-001');
  });

  it.each(['', '   ', null, undefined])('rejects empty value %p', (value) => {
    expect(() => SupplierCode.create(value as unknown as string)).toThrow(
      UnprocessableEntityException,
    );
  });

  it('accepts a value with 50 characters', () => {
    const value = 'C'.repeat(50);

    expect(SupplierCode.create(value).getValue()).toBe(value);
  });

  it('rejects a value longer than 50 characters', () => {
    expect(() => SupplierCode.create('C'.repeat(51))).toThrow(
      'Supplier code is too long',
    );
  });
});

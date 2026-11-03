import { describe, expect, it } from '@jest/globals';
import { UnprocessableEntityException } from '@nestjs/common';
import { SupplierPhone } from './supplier-phone.value-object';

describe('SupplierPhone', () => {
  it('strips spaces, dots, hyphens and parentheses', () => {
    expect(SupplierPhone.create('  090 123 4567  ').getValue()).toBe(
      '0901234567',
    );
    expect(SupplierPhone.create('090-123-4567').getValue()).toBe('0901234567');
    expect(SupplierPhone.create('(090) 123.4567').getValue()).toBe(
      '0901234567',
    );
  });

  it.each(['0321234567', '0391234567', '0521234567', '0591234567'])(
    'accepts 03x/05x mobile number %s',
    (value) => {
      expect(SupplierPhone.create(value).getValue()).toBe(value);
    },
  );

  it.each(['0701234567', '0791234567', '0811234567', '0891234567'])(
    'accepts 07x/08x mobile number %s',
    (value) => {
      expect(SupplierPhone.create(value).getValue()).toBe(value);
    },
  );

  it.each(['0901234567', '0931234567', '0991234567'])(
    'accepts 09x mobile number %s',
    (value) => {
      expect(SupplierPhone.create(value).getValue()).toBe(value);
    },
  );

  it.each(['02412345678', '02812345678', '02031234567'])(
    'accepts landline number %s',
    (value) => {
      expect(SupplierPhone.create(value).getValue()).toBe(value);
    },
  );

  it('normalizes +84 mobile numbers to the local 0 form', () => {
    expect(SupplierPhone.create('+84901234567').getValue()).toBe('0901234567');
  });

  it('normalizes 84 mobile numbers to the local 0 form', () => {
    expect(SupplierPhone.create('84901234567').getValue()).toBe('0901234567');
  });

  it('normalizes +84 landline numbers to the local 0 form', () => {
    expect(SupplierPhone.create('+842412345678').getValue()).toBe(
      '02412345678',
    );
  });

  it.each(['', '   ', null, undefined, 901234567])(
    'rejects missing value %p',
    (value) => {
      expect(() => SupplierPhone.create(value)).toThrow(
        UnprocessableEntityException,
      );
    },
  );

  it.each([
    '0123456789',
    '0301234567',
    '0501234567',
    '0801234567',
    '090123456',
    '09012345678',
    '0241234567',
    '090abc4567',
    '+8412345678',
    '8412345678',
    '---',
  ])('rejects invalid phone number %s', (value) => {
    expect(() => SupplierPhone.create(value)).toThrow(
      'Invalid Vietnam phone number',
    );
  });

  it('compares by value', () => {
    expect(
      SupplierPhone.create('0901234567').equals(
        SupplierPhone.create('+84901234567'),
      ),
    ).toBe(true);
  });
});

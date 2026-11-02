import { describe, expect, it } from '@jest/globals';
import { UnprocessableEntityException } from '@nestjs/common';
import { Phone } from './phone.value-object';

describe('Phone', () => {
  it('trims whitespace', () => {
    expect(Phone.create('  0901234567  ').getValue()).toBe('0901234567');
  });

  it.each(['', '   ', null, undefined])('rejects empty value %p', (value) => {
    expect(() => Phone.create(value as unknown as string)).toThrow(
      UnprocessableEntityException,
    );
  });

  it('accepts a value with 30 characters', () => {
    const value = '0'.repeat(30);

    expect(Phone.create(value).getValue()).toBe(value);
  });

  it('rejects a value longer than 30 characters', () => {
    expect(() => Phone.create('0'.repeat(31))).toThrow(
      'Phone number is too long',
    );
  });
});

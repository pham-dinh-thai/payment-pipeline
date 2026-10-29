import { describe, expect, it } from '@jest/globals';
import { DomainValidationException } from '../../../../shared/domain/domain-validation.error';
import { ProductId } from './product-id.value-object';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('ProductId', () => {
  it('generates a valid UUID v4', () => {
    expect(ProductId.generate().getValue()).toMatch(UUID_V4);
  });

  it('accepts an existing UUID and trims whitespace', () => {
    const id = ProductId.generate().getValue();

    expect(ProductId.create(`  ${id}  `).getValue()).toBe(id);
  });

  it.each(['', '   ', 'not-a-uuid', '00000000-0000-0000-0000-000000000000'])(
    'rejects %s',
    (value) => {
      expect(() => ProductId.create(value)).toThrow(DomainValidationException);
    },
  );
});

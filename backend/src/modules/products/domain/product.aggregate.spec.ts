import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { Product } from './product.aggregate';

const createProduct = (): Product =>
  Product.create({
    name: 'Coffee',
    unitPrice: '12.50',
    quantity: 3,
  });

describe('Product', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates a product with generated id and normalized values', () => {
    const product = createProduct();

    expect(product.getId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(product.getName()).toBe('Coffee');
    expect(product.getUnitPrice()).toBe('12.50');
    expect(product.getQuantity()).toBe(3);
  });

  it('sets createdAt equal to updatedAt on creation', () => {
    const product = createProduct();

    expect(product.getCreatedAt()).toEqual(product.getUpdatedAt());
  });

  it('updates name and updatedAt', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const product = createProduct();
    const createdAt = product.getUpdatedAt();

    jest.setSystemTime(new Date('2026-01-01T00:00:01.000Z'));
    product.updateName('Tea');

    expect(product.getName()).toBe('Tea');
    expect(product.getUpdatedAt().getTime()).toBeGreaterThan(
      createdAt.getTime(),
    );
    expect(product.getCreatedAt()).toEqual(createdAt);
  });

  it('updates unit price and quantity through value objects', () => {
    const product = createProduct();

    product.updateUnitPrice('99.99');
    product.updateQuantity(0);

    expect(product.getUnitPrice()).toBe('99.99');
    expect(product.getQuantity()).toBe(0);
  });

  it('restores a product from persisted data', () => {
    const product = Product.fromPersistent({
      id: 'b3d7f2a8-7a0e-4f1c-9c1a-4d3f5e6a7b8c',
      name: 'Tea',
      unitPrice: '5.00',
      quantity: 7,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    });

    expect(product.getId()).toBe('b3d7f2a8-7a0e-4f1c-9c1a-4d3f5e6a7b8c');
    expect(product.getName()).toBe('Tea');
    expect(product.getUnitPrice()).toBe('5.00');
    expect(product.getQuantity()).toBe(7);
  });
});

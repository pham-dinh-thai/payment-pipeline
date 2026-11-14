import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { UnprocessableEntityException } from '@nestjs/common';
import { Batch, CreateBatchProps } from './batch.entity';
import { BatchStatus } from './batch-status.enum';

const PRODUCT_ID = 'b3d7f2a8-7a0e-4f1c-9c1a-4d3f5e6a7b8c';
const CREATED_BY = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
const EXPIRES_AT = new Date('2030-01-01T00:00:00.000Z');

const createBatch = (overrides: Partial<CreateBatchProps> = {}): Batch =>
  Batch.create({
    lotNumber: 'LOT-001',
    productId: PRODUCT_ID,
    quantity: 10,
    unitCost: '2500',
    status: BatchStatus.ACTIVE,
    expiresAt: EXPIRES_AT,
    createdBy: CREATED_BY,
    ...overrides,
  });

describe('Batch', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  describe('create', () => {
    it('creates a batch with generated id and normalized values', () => {
      const batch = createBatch({ lotNumber: '  LOT-001  ' });

      expect(batch.getId()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(batch.getLotNumber()).toBe('LOT-001');
      expect(batch.getProductId()).toBe(PRODUCT_ID);
      expect(batch.getQuantity()).toBe(10);
      expect(batch.getUnitCost()).toBe('2500');
      expect(batch.getStatus()).toBe(BatchStatus.ACTIVE);
      expect(batch.getExpiresAt()).toEqual(EXPIRES_AT);
      expect(batch.getCreatedBy()).toBe(CREATED_BY);
    });

    it('sets createdAt equal to updatedAt on creation', () => {
      const batch = createBatch();

      expect(batch.getCreatedAt()).toEqual(batch.getUpdatedAt());
    });
  });

  describe('fromPersistent', () => {
    it('restores a batch from persisted data', () => {
      const createdAt = new Date('2026-01-01T00:00:00.000Z');
      const updatedAt = new Date('2026-01-02T00:00:00.000Z');

      const batch = Batch.fromPersistent({
        id: PRODUCT_ID,
        lotNumber: 'LOT-002',
        productId: PRODUCT_ID,
        quantity: 7,
        unitCost: '5000',
        status: BatchStatus.OUT,
        expiresAt: EXPIRES_AT,
        createdBy: CREATED_BY,
        createdAt,
        updatedAt,
      });

      expect(batch.getId()).toBe(PRODUCT_ID);
      expect(batch.getLotNumber()).toBe('LOT-002');
      expect(batch.getQuantity()).toBe(7);
      expect(batch.getStatus()).toBe(BatchStatus.OUT);
      expect(batch.getCreatedAt()).toEqual(createdAt);
      expect(batch.getUpdatedAt()).toEqual(updatedAt);
    });
  });

  describe('issue', () => {
    it('subtracts stock and updates updatedAt', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

      const batch = createBatch({ quantity: 10 });
      const createdAt = batch.getCreatedAt();

      jest.setSystemTime(new Date('2026-01-01T00:00:01.000Z'));
      batch.issue(4);

      expect(batch.getQuantity()).toBe(6);
      expect(batch.getUpdatedAt().getTime()).toBeGreaterThan(
        createdAt.getTime(),
      );
    });

    it('allows issuing all remaining stock', () => {
      const batch = createBatch({ quantity: 10 });

      batch.issue(10);

      expect(batch.getQuantity()).toBe(0);
    });

    it('rejects issuing more than available and keeps stock unchanged', () => {
      const batch = createBatch({ quantity: 10 });

      expect(() => batch.issue(11)).toThrow(
        'Not enough stock: available 10, requested 11',
      );
      expect(batch.getQuantity()).toBe(10);
    });

    it.each([0, -1, 1.5, NaN, Infinity])(
      'rejects invalid quantity %s',
      (quantity) => {
        const batch = createBatch({ quantity: 10 });

        expect(() => batch.issue(quantity)).toThrow(
          UnprocessableEntityException,
        );
        expect(batch.getQuantity()).toBe(10);
      },
    );
  });

  describe('reconcile', () => {
    it('overwrites stock with counted quantity when counted is higher', () => {
      const batch = createBatch({ quantity: 10 });

      batch.reconcile(100);

      expect(batch.getQuantity()).toBe(100);
    });

    it('overwrites stock with counted quantity when counted is lower', () => {
      const batch = createBatch({ quantity: 10 });

      batch.reconcile(2);

      expect(batch.getQuantity()).toBe(2);
    });

    it('accepts zero counted quantity', () => {
      const batch = createBatch({ quantity: 10 });

      batch.reconcile(0);

      expect(batch.getQuantity()).toBe(0);
    });

    it('updates updatedAt', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

      const batch = createBatch({ quantity: 10 });
      const createdAt = batch.getCreatedAt();

      jest.setSystemTime(new Date('2026-01-01T00:00:01.000Z'));
      batch.reconcile(3);

      expect(batch.getUpdatedAt().getTime()).toBeGreaterThan(
        createdAt.getTime(),
      );
    });

    it.each([-1, 1.5, NaN, Infinity])(
      'rejects invalid counted quantity %s',
      (quantity) => {
        const batch = createBatch({ quantity: 10 });

        expect(() => batch.reconcile(quantity)).toThrow(
          UnprocessableEntityException,
        );
        expect(batch.getQuantity()).toBe(10);
      },
    );
  });

  describe('getTotalCost', () => {
    it('returns unit cost multiplied by quantity', () => {
      const batch = createBatch({ quantity: 10, unitCost: '2500' });

      expect(batch.getTotalCost()).toBe('25000');
    });
  });
});

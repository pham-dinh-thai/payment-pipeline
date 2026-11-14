import { describe, expect, it } from '@jest/globals';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Batch } from './batch/batch.entity';
import { BatchStatus } from './batch/batch-status.enum';
import { Inventory } from './inventory.aggregate';

const PRODUCT_ID = 'b3d7f2a8-7a0e-4f1c-9c1a-4d3f5e6a7b8c';
const CREATED_BY = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
const EXPIRES_AT = new Date('2030-01-01T00:00:00.000Z');
const UNKNOWN_BATCH_ID = 'f1e2d3c4-b5a6-4978-8a9b-0c1d2e3f4a5b';

const createBatch = (lotNumber: string, quantity: number): Batch =>
  Batch.create({
    lotNumber,
    productId: PRODUCT_ID,
    quantity,
    unitCost: '2500',
    status: BatchStatus.ACTIVE,
    expiresAt: EXPIRES_AT,
    createdBy: CREATED_BY,
  });

describe('Inventory', () => {
  describe('create', () => {
    it('creates an empty inventory for a product', () => {
      const inventory = Inventory.create(PRODUCT_ID);

      expect(inventory.getProductId()).toBe(PRODUCT_ID);
      expect(inventory.getBatches()).toEqual([]);
      expect(inventory.getNewBatches()).toEqual([]);
      expect(inventory.getUpdatedBatches()).toEqual([]);
    });
  });

  describe('fromPersistent', () => {
    it('restores batches without marking them as new or updated', () => {
      const batch = createBatch('LOT-001', 10);

      const inventory = Inventory.fromPersistent(PRODUCT_ID, [batch]);

      expect(inventory.getProductId()).toBe(PRODUCT_ID);
      expect(inventory.getBatches()).toEqual([batch]);
      expect(inventory.getNewBatches()).toEqual([]);
      expect(inventory.getUpdatedBatches()).toEqual([]);
    });
  });

  describe('addBatch', () => {
    it('adds a new batch and returns its id', () => {
      const inventory = Inventory.create(PRODUCT_ID);

      const { batchId } = inventory.addBatch({
        lotNumber: 'LOT-001',
        productId: PRODUCT_ID,
        quantity: 10,
        unitCost: '2500',
        status: BatchStatus.ACTIVE,
        expiresAt: EXPIRES_AT,
        createdBy: CREATED_BY,
      });

      expect(inventory.getBatches()).toHaveLength(1);
      expect(inventory.getNewBatches()).toHaveLength(1);
      expect(inventory.getUpdatedBatches()).toEqual([]);
      expect(batchId).toBe(inventory.getBatches()[0].getId());
    });

    it('adds multiple batches', () => {
      const inventory = Inventory.create(PRODUCT_ID);

      inventory.addBatch({
        lotNumber: 'LOT-001',
        productId: PRODUCT_ID,
        quantity: 10,
        unitCost: '2500',
        status: BatchStatus.ACTIVE,
        expiresAt: EXPIRES_AT,
        createdBy: CREATED_BY,
      });
      inventory.addBatch({
        lotNumber: 'LOT-002',
        productId: PRODUCT_ID,
        quantity: 5,
        unitCost: '3000',
        status: BatchStatus.ACTIVE,
        expiresAt: EXPIRES_AT,
        createdBy: CREATED_BY,
      });

      expect(inventory.getBatches()).toHaveLength(2);
      expect(inventory.getNewBatches()).toHaveLength(2);
    });
  });

  describe('issueStock', () => {
    it('subtracts stock from the target batch and returns the new quantity', () => {
      const batch = createBatch('LOT-001', 10);
      const inventory = Inventory.fromPersistent(PRODUCT_ID, [batch]);

      const quantity = inventory.issueStock(batch.getId(), 4);

      expect(quantity).toBe(6);
      expect(batch.getQuantity()).toBe(6);
      expect(inventory.getUpdatedBatches()).toEqual([batch]);
    });

    it('does not mark the batch as updated when stock is insufficient', () => {
      const batch = createBatch('LOT-001', 10);
      const inventory = Inventory.fromPersistent(PRODUCT_ID, [batch]);

      expect(() => inventory.issueStock(batch.getId(), 11)).toThrow(
        UnprocessableEntityException,
      );
      expect(batch.getQuantity()).toBe(10);
      expect(inventory.getUpdatedBatches()).toEqual([]);
    });

    it('throws when batch does not exist', () => {
      const inventory = Inventory.create(PRODUCT_ID);

      expect(() => inventory.issueStock(UNKNOWN_BATCH_ID, 1)).toThrow(
        NotFoundException,
      );
    });
  });

  describe('reconcileStock', () => {
    it('overwrites stock with counted quantity and returns it', () => {
      const batch = createBatch('LOT-001', 10);
      const inventory = Inventory.fromPersistent(PRODUCT_ID, [batch]);

      const quantity = inventory.reconcileStock(batch.getId(), 7);

      expect(quantity).toBe(7);
      expect(batch.getQuantity()).toBe(7);
      expect(inventory.getUpdatedBatches()).toEqual([batch]);
    });

    it('accepts zero as counted quantity', () => {
      const batch = createBatch('LOT-001', 10);
      const inventory = Inventory.fromPersistent(PRODUCT_ID, [batch]);

      const quantity = inventory.reconcileStock(batch.getId(), 0);

      expect(quantity).toBe(0);
      expect(batch.getQuantity()).toBe(0);
    });

    it('does not mark the batch as updated when counted quantity is invalid', () => {
      const batch = createBatch('LOT-001', 10);
      const inventory = Inventory.fromPersistent(PRODUCT_ID, [batch]);

      expect(() => inventory.reconcileStock(batch.getId(), -1)).toThrow(
        UnprocessableEntityException,
      );
      expect(batch.getQuantity()).toBe(10);
      expect(inventory.getUpdatedBatches()).toEqual([]);
    });

    it('throws when batch does not exist', () => {
      const inventory = Inventory.create(PRODUCT_ID);

      expect(() => inventory.reconcileStock(UNKNOWN_BATCH_ID, 1)).toThrow(
        NotFoundException,
      );
    });
  });
});

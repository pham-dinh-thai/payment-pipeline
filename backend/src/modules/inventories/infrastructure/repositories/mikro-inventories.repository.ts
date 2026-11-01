import { Injectable, NotFoundException } from '@nestjs/common';
import { IInventoriesRepository } from '../../domain/inventories.repository';
import { EntityManager, LockMode } from '@mikro-orm/core';
import { Inventory } from '../../domain/inventory.aggregate';
import { MikroBatch } from '../entities/mikro-batch.entity';
import { BatchMapper } from '../mappers/batch.mapper';

@Injectable()
export class MikroInventoriesRepository implements IInventoriesRepository {
  public constructor(private readonly entityManager: EntityManager) {}

  public async findByProductId(productId: string): Promise<Inventory | null> {
    const mikroBatches = await this.entityManager.find(
      MikroBatch,
      {
        productId,
      },
      {
        orderBy: { expiresAt: 'asc', createdAt: 'asc', id: 'asc' },
      },
    );

    if (mikroBatches.length === 0) {
      return null;
    }

    return Inventory.fromPersistent(
      productId,
      mikroBatches.map((mikroBatch) => BatchMapper.toDomain(mikroBatch)),
    );
  }

  public async adjustBatchStock(
    productId: string,
    batchId: string,
    delta: number,
  ): Promise<number> {
    return this.entityManager.transactional(async (em) => {
      const mikroBatch = await em.findOne(
        MikroBatch,
        { id: batchId, productId },
        { lockMode: LockMode.PESSIMISTIC_WRITE },
      );

      if (!mikroBatch) {
        throw new NotFoundException(
          `Batch id ${batchId} not found for product ${productId}`,
        );
      }

      const batch = BatchMapper.toDomain(mikroBatch);

      batch.adjustStock(delta);

      await em.nativeUpdate(
        MikroBatch,
        { id: batchId },
        { quantity: batch.getQuantity(), updatedAt: batch.getUpdatedAt() },
      );

      return batch.getQuantity();
    });
  }

  public async save(inventory: Inventory): Promise<Inventory> {
    if (inventory.getNewBatches().length > 0) {
      await this.entityManager.transactional(async (em) => {
        for (const batch of inventory.getNewBatches()) {
          await em.insert(MikroBatch, BatchMapper.toMikroOrm(batch));
        }
      });
    }

    return inventory;
  }
}

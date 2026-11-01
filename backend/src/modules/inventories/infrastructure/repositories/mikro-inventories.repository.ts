import { Injectable } from '@nestjs/common';
import { IInventoriesRepository } from '../../domain/inventories.repository';
import { EntityManager, p } from '@mikro-orm/core';
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

  public async save(inventory: Inventory): Promise<Inventory> {
    const result = await this.entityManager.transactional(async (em) => {
      if (inventory.getNewBatches().length > 0) {
        for (const batch of inventory.getNewBatches()) {
          await em.insert(MikroBatch, BatchMapper.toMikroOrm(batch));
        }
      }

      if (inventory.getUpdatedBatches().length > 0) {
        for (const batch of inventory.getUpdatedBatches()) {
          // Only update non-readonly fields
          await em.nativeUpdate(
            MikroBatch,
            { id: batch.getId() },
            {
              quantity: batch.getQuantity(),
              status: batch.getStatus(),
              expiresAt: batch.getExpiresAt(),
              updatedAt: batch.getUpdatedAt(),
            },
          );
        }
      }

      return inventory;
    });

    return result;
  }
}

import { Injectable } from '@nestjs/common';
import { IInventoriesRepository } from '../../domain/inventories.repository';
import { EntityManager, p } from '@mikro-orm/core';
import { Inventory } from '../../domain/inventory.aggregate';
import { MikroBatch } from '../entities/mikro-batch.entity';

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
      mikroBatches.map((mikroBatch) => ({
        id: mikroBatch.id,
        lotNumber: mikroBatch.lotNumber,
        productId: mikroBatch.productId,
        quantity: mikroBatch.quantity,
        unitCost: mikroBatch.unitCost,
        status: mikroBatch.status,
        expiresAt: mikroBatch.expiresAt,
        createdBy: mikroBatch.createdBy,
        createdAt: mikroBatch.createdAt,
        updatedAt: mikroBatch.updatedAt,
      })),
    );
  }

  public async save(inventory: Inventory): Promise<Inventory> {
    const result = await this.entityManager.transactional(async (em) => {
      for (const batch of inventory.getNewBatches()) {
        await em.upsert(MikroBatch, {
          id: batch.getId(),
          lotNumber: batch.getLotNumber(),
          productId: batch.getProductId(),
          quantity: batch.getQuantity(),
          unitCost: batch.getUnitCost(),
          status: batch.getStatus(),
          expiresAt: batch.getExpiresAt(),
          createdBy: batch.getCreatedBy(),
          createdAt: batch.getCreatedAt(),
          updatedAt: batch.getUpdatedAt(),
        });
      }

      return inventory;
    });

    return result;
  }
}

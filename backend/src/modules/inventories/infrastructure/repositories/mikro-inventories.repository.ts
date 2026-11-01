import { Injectable } from '@nestjs/common';
import {
  FindInventoryOptions,
  IInventoriesRepository,
} from '../../domain/inventories.repository';
import { EntityManager, LockMode } from '@mikro-orm/core';
import { Inventory } from '../../domain/inventory.aggregate';
import { MikroBatch } from '../entities/mikro-batch.entity';
import { BatchMapper } from '../mappers/batch.mapper';

@Injectable()
export class MikroInventoriesRepository implements IInventoriesRepository {
  public constructor(private readonly entityManager: EntityManager) {}

  public async findByProductId(
    productId: string,
    options: FindInventoryOptions = {},
  ): Promise<Inventory | null> {
    const mikroBatches = await this.entityManager.find(
      MikroBatch,
      {
        productId,
      },
      {
        orderBy: { expiresAt: 'asc', createdAt: 'asc', id: 'asc' },
        lockMode: options.forUpdate ? LockMode.PESSIMISTIC_WRITE : undefined,
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
    for (const batch of inventory.getNewBatches()) {
      await this.entityManager.insert(
        MikroBatch,
        BatchMapper.toMikroOrm(batch),
      );
    }

    for (const batch of inventory.getUpdatedBatches()) {
      await this.entityManager.nativeUpdate(
        MikroBatch,
        { id: batch.getId() },
        { quantity: batch.getQuantity(), updatedAt: batch.getUpdatedAt() },
      );
    }

    return inventory;
  }
}

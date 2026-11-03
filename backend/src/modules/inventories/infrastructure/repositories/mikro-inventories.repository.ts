import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FindInventoryOptions,
  IInventoriesRepository,
} from '../../domain/inventories.repository';
import {
  EntityManager,
  ForeignKeyConstraintViolationException,
  LockMode,
  UniqueConstraintViolationException,
} from '@mikro-orm/core';
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
    try {
      const news = inventory.getNewBatches();

      if (news.length) {
        await this.entityManager.insertMany(
          MikroBatch,
          news.map((batch) => BatchMapper.toMikroOrm(batch)),
        );
      }

      const updates = [
        ...new Map(
          inventory.getUpdatedBatches().map((batch) => [batch.getId(), batch]),
        ).values(),
      ];

      if (updates.length) {
        await this.entityManager.getConnection().execute(
          `update "batches"
              set "quantity" = v.quantity,
                  "updated_at" = v.updated_at
             from unnest(?::uuid[], ?::int[], ?::timestamptz[])
               as v(id, quantity, updated_at)
            where "batches"."id" = v.id`,
          [
            updates.map((batch) => batch.getId()),
            updates.map((batch) => batch.getQuantity()),
            updates.map((batch) => batch.getUpdatedAt()),
          ],
          'run',
          this.entityManager.getTransactionContext(),
        );
      }

      return inventory;
    } catch (e) {
      if (e instanceof UniqueConstraintViolationException) {
        throw new ConflictException(
          'Batch already exists for this product and lot number',
        );
      }

      if (e instanceof ForeignKeyConstraintViolationException) {
        throw new NotFoundException('Product not found');
      }

      throw e;
    }
  }
}

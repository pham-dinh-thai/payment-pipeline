import { Inventory } from './inventory.aggregate';

export interface IInventoriesRepository {
  findByProductId(productId: string): Promise<Inventory | null>;

  adjustBatchStock(
    productId: string,
    batchId: string,
    delta: number,
  ): Promise<number>;

  save(inventory: Inventory): Promise<Inventory>;
}

export const INVENTORIES_REPOSITORY = 'IInventoriesRepository';

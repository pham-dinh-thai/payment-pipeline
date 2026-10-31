import { Inventory } from './inventory.aggregate';

export interface IInventoriesRepository {
  findByProductId(productId: string): Promise<Inventory | null>;

  save(inventory: Inventory): Promise<Inventory>;
}

export const INVENTORIES_REPOSITORY = 'IInventoriesRepository';

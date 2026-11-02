import { Inventory } from './inventory.aggregate';

export type FindInventoryOptions = {
  forUpdate?: boolean;
};

export interface IInventoriesRepository {
  findByProductId(
    productId: string,
    options?: FindInventoryOptions,
  ): Promise<Inventory | null>;

  save(inventory: Inventory): Promise<Inventory>;
}

export const INVENTORIES_REPOSITORY = 'IInventoriesRepository';

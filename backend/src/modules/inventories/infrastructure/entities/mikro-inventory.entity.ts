import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

@Entity({
  tableName: 'inventories',
  view: true,
  expression: `select
      b.product_id,
      sum(b.quantity)::int as total_quantity,
      count(*)::int as batch_count,
      min(b.expires_at) filter (where b.quantity > 0) as nearest_expiry,
      sum(b.quantity * b.unit_cost) as stock_value,
      max(b.updated_at) as updated_at
    from batches b
    group by b.product_id`,
})
export class MikroInventory {
  @PrimaryKey({ fieldName: 'product_id', type: 'uuid' })
  productId!: string;

  @Property({ fieldName: 'total_quantity', type: 'int' })
  totalQuantity!: number;

  @Property({ fieldName: 'batch_count', type: 'int' })
  batchCount!: number;

  @Property({ fieldName: 'nearest_expiry', type: 'date' })
  nearestExpiry!: Date | null;

  @Property({ fieldName: 'stock_value', type: 'decimal' })
  stockValue!: string | null;

  @Property({ fieldName: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

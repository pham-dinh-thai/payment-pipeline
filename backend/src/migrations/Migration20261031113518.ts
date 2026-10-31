import { Migration } from '@mikro-orm/migrations';

export class Migration20261031113518 extends Migration {

  override name = 'Migration20261031113518';

  override up(): void | Promise<void> {
    this.addSql(`create view "inventories" as select
      b.product_id,
      sum(b.quantity)::int as total_quantity,
      count(*)::int as batch_count,
      min(b.expires_at) filter (where b.quantity > 0) as nearest_expiry,
      sum(b.quantity * b.unit_cost) as stock_value,
      max(b.updated_at) as updated_at
    from batches b
    group by b.product_id;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop view if exists "inventories" cascade;`);
  }

}

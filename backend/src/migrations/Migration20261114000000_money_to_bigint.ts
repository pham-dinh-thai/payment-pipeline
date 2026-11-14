import { Migration } from '@mikro-orm/migrations';

export class Migration20261114000000_money_to_bigint extends Migration {
  override name = 'Migration20261114000000_money_to_bigint';

  override up(): void | Promise<void> {
    // The inventories view reads batches.unit_cost, so it has to be dropped
    // before the column type can be changed.
    this.addSql(`drop view if exists "inventories" cascade;`);

    this.addSql(
      `alter table "products" alter column "unit_price" type bigint using round("unit_price")::bigint;`,
    );
    this.addSql(
      `alter table "goods_receipt_lines" alter column "unit_cost" type bigint using round("unit_cost")::bigint;`,
    );
    this.addSql(
      `alter table "batches" alter column "unit_cost" type bigint using round("unit_cost")::bigint;`,
    );

    this.addSql(`create view "inventories" as select
      b.product_id,
      sum(b.quantity)::int as total_quantity,
      count(*)::int as batch_count,
      min(b.expires_at) filter (where b.quantity > 0) as nearest_expiry,
      sum(b.quantity * b.unit_cost)::bigint as stock_value,
      max(b.updated_at) as updated_at
    from batches b
    group by b.product_id;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop view if exists "inventories" cascade;`);

    this.addSql(
      `alter table "products" alter column "unit_price" type numeric(12,2) using "unit_price"::numeric(12,2);`,
    );
    this.addSql(
      `alter table "goods_receipt_lines" alter column "unit_cost" type numeric(12,2) using "unit_cost"::numeric(12,2);`,
    );
    this.addSql(
      `alter table "batches" alter column "unit_cost" type numeric(12,2) using "unit_cost"::numeric(12,2);`,
    );

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
}

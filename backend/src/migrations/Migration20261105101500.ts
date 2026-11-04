import { Migration } from '@mikro-orm/migrations';

export class Migration20261105101500 extends Migration {
  override name = 'Migration20261105101500';

  override up(): void | Promise<void> {
    this.addSql(
      `create table "goods_receipts" ("id" uuid not null, "code" varchar(255) not null, "supplier_id" uuid not null, "status" text not null, "created_by" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, primary key ("id"));`,
    );
    this.addSql(
      `alter table "goods_receipts" add constraint "goods_receipts_code_unique" unique ("code");`,
    );
    this.addSql(
      `alter table "goods_receipts" add constraint "goods_receipts_status_check" check ("status" in ('pending', 'confirmed', 'cancelled'));`,
    );
    this.addSql(
      `alter table "goods_receipts" add constraint "goods_receipts_supplier_id_foreign" foreign key ("supplier_id") references "suppliers" ("id") on update cascade on delete no action;`,
    );

    this.addSql(
      `create table "goods_receipt_lines" ("id" uuid not null, "goods_receipt_id" uuid not null, "product_id" uuid not null, "lot_number" varchar(255) not null, "quantity" int not null, "unit_cost" numeric(12,2) not null, "expires_at" date not null, "batch_id" uuid null, "created_at" timestamptz not null, "updated_at" timestamptz not null, primary key ("id"));`,
    );
    this.addSql(
      `alter table "goods_receipt_lines" add constraint "goods_receipt_lines_receipt_product_lot_unique" unique ("goods_receipt_id", "product_id", "lot_number");`,
    );
    this.addSql(
      `alter table "goods_receipt_lines" add constraint "goods_receipt_lines_quantity_check" check ("quantity" > 0);`,
    );
    this.addSql(
      `alter table "goods_receipt_lines" add constraint "goods_receipt_lines_unit_cost_check" check ("unit_cost" >= 0);`,
    );
    this.addSql(
      `alter table "goods_receipt_lines" add constraint "goods_receipt_lines_goods_receipt_id_foreign" foreign key ("goods_receipt_id") references "goods_receipts" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "goods_receipt_lines" add constraint "goods_receipt_lines_product_id_foreign" foreign key ("product_id") references "products" ("id") on update cascade on delete no action;`,
    );
    this.addSql(
      `alter table "goods_receipt_lines" add constraint "goods_receipt_lines_batch_id_foreign" foreign key ("batch_id") references "batches" ("id") on update cascade on delete set null;`,
    );

    this.addSql(`create sequence "goods_receipt_code_seq";`);
    this.addSql(
      `select setval('goods_receipt_code_seq', coalesce((select max(substring("code" from '([0-9]+)$')::int) from "goods_receipts"), 0) + 1, false);`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "goods_receipt_lines" cascade;`);
    this.addSql(`drop table if exists "goods_receipts" cascade;`);
    this.addSql(`drop sequence if exists "goods_receipt_code_seq";`);
  }
}

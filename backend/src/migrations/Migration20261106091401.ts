import { Migration } from '@mikro-orm/migrations';

export class Migration20261106091401 extends Migration {

  override name = 'Migration20261106091401';

  override up(): void | Promise<void> {
    this.addSql(`alter table "goods_receipt_lines" drop constraint "goods_receipt_lines_batch_id_foreign";`);
    this.addSql(`alter table "goods_receipt_lines" drop constraint "goods_receipt_lines_goods_receipt_id_foreign";`);

    this.addSql(`alter table "goods_receipt_lines" drop constraint "goods_receipt_lines_quantity_check";`);
    this.addSql(`alter table "goods_receipt_lines" drop constraint "goods_receipt_lines_unit_cost_check";`);
    this.addSql(`alter table "goods_receipt_lines" drop constraint "goods_receipt_lines_receipt_product_lot_unique";`);
    this.addSql(`alter table "goods_receipt_lines" add constraint "goods_receipt_lines_goods_receipt_id_product_id_l_b1421_unique" unique ("goods_receipt_id", "product_id", "lot_number");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "goods_receipt_lines" add constraint "goods_receipt_lines_batch_id_foreign" foreign key ("batch_id") references "batches" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "goods_receipt_lines" add constraint "goods_receipt_lines_goods_receipt_id_foreign" foreign key ("goods_receipt_id") references "goods_receipts" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "goods_receipt_lines" drop constraint "goods_receipt_lines_goods_receipt_id_product_id_l_b1421_unique";`);
    this.addSql(`alter table "goods_receipt_lines" add constraint "goods_receipt_lines_receipt_product_lot_unique" unique ("goods_receipt_id", "product_id", "lot_number");`);
    this.addSql(`alter table "goods_receipt_lines" add constraint "goods_receipt_lines_quantity_check" check (quantity > 0);`);
    this.addSql(`alter table "goods_receipt_lines" add constraint "goods_receipt_lines_unit_cost_check" check (unit_cost >= 0);`);
  }

}

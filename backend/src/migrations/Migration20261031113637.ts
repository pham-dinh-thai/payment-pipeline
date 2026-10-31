import { Migration } from '@mikro-orm/migrations';

export class Migration20261031113637 extends Migration {

  override name = 'Migration20261031113637';

  override up(): void | Promise<void> {
    this.addSql(`alter table "batches" add constraint "batches_product_id_lot_number_unique" unique ("product_id", "lot_number");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "batches" drop constraint "batches_product_id_lot_number_unique";`);
  }

}

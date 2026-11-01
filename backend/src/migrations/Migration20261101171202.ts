import { Migration } from '@mikro-orm/migrations';

export class Migration20261101171202 extends Migration {
  override name = 'Migration20261101171202';

  override up(): void | Promise<void> {
    this.addSql(
      `alter table "batches" add constraint "batches_product_id_foreign" foreign key ("product_id") references "products" ("id") on update cascade on delete no action;`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(
      `alter table "batches" drop constraint "batches_product_id_foreign";`,
    );
  }
}

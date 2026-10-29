import { Migration } from '@mikro-orm/migrations';

export class Migration20261028085546 extends Migration {

  override name = 'Migration20261028085546';

  override up(): void | Promise<void> {
    this.addSql(`alter table "products" add "created_at" timestamptz not null, add "updated_at" timestamptz not null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "products" drop column "created_at", drop column "updated_at";`);
  }

}

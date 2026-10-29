import { Migration } from '@mikro-orm/migrations';

export class Migration20261028083800 extends Migration {
  override name = 'Migration20261028083800';

  override up(): void | Promise<void> {
    this.addSql(
      `create table "products" ("id" uuid not null default gen_random_uuid(), primary key ("id"));`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "products" cascade;`);
  }
}

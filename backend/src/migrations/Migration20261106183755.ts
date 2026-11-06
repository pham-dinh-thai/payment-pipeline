import { Migration } from '@mikro-orm/migrations';

export class Migration20261106183755 extends Migration {

  override name = 'Migration20261106183755';

  override up(): void | Promise<void> {
    this.addSql(`create table "customers" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, primary key ("id"));`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "customers" cascade;`);
  }

}

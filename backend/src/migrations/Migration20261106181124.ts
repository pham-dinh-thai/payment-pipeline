import { Migration } from '@mikro-orm/migrations';

export class Migration20261106181124 extends Migration {

  override name = 'Migration20261106181124';

  override up(): void | Promise<void> {
    this.addSql(`create table "accounts" ("id" uuid not null, "user_id" varchar(255) not null, "password" varchar(255) not null, "is_active" boolean not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, primary key ("id"));`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "accounts" cascade;`);
  }

}

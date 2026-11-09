import { Migration } from '@mikro-orm/migrations';

export class Migration20261108180021 extends Migration {
  override name = 'Migration20261108180021';

  override up(): void | Promise<void> {
    this.addSql(
      `create table "roles" ("id" uuid not null, "name" varchar(255) not null, "permissions" text[] not null, "is_super_admin" boolean not null default false, "version" int not null default 1, "created_at" timestamptz not null, "updated_at" timestamptz not null, primary key ("id"));`,
    );
    this.addSql(
      `alter table "roles" add constraint "roles_name_unique" unique ("name");`,
    );
    this.addSql(
      `create index "roles_permissions_gin" on "roles" using gin ("permissions");`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "roles" cascade;`);
  }
}

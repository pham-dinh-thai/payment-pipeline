import { Migration } from '@mikro-orm/migrations';

export class Migration20261106095733 extends Migration {

  override name = 'Migration20261106095733';

  override up(): void | Promise<void> {
    this.addSql(`create table "users" ("id" uuid not null, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "email" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, primary key ("id"));`);
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "users" cascade;`);
  }

}

import { Migration } from '@mikro-orm/migrations';

export class Migration20261102064744 extends Migration {
  override name = 'Migration20261102064744';

  override up(): void | Promise<void> {
    this.addSql(
      `create table "suppliers" ("id" uuid not null, "code" varchar(255) not null, "name" varchar(255) not null, "status" text not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "phone" varchar(255) null, "email" varchar(255) null, "address" varchar(255) null, "tax_code" varchar(255) null, primary key ("id"));`,
    );
    this.addSql(
      `alter table "suppliers" add constraint "suppliers_code_unique" unique ("code");`,
    );
    this.addSql(
      `alter table "suppliers" add constraint "suppliers_phone_unique" unique ("phone");`,
    );
    this.addSql(
      `alter table "suppliers" add constraint "suppliers_email_unique" unique ("email");`,
    );
    this.addSql(
      `alter table "suppliers" add constraint "suppliers_address_unique" unique ("address");`,
    );
    this.addSql(
      `alter table "suppliers" add constraint "suppliers_tax_code_unique" unique ("tax_code");`,
    );

    this.addSql(
      `alter table "suppliers" add constraint "suppliers_status_check" check ("status" in ('active', 'inactive'));`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "suppliers" cascade;`);
  }
}

import { Migration } from '@mikro-orm/migrations';

export class Migration20261114061656_add_expenses extends Migration {
  override name = 'Migration20261114061656_add_expenses';

  override up(): void | Promise<void> {
    this.addSql(
      `create table "expenses" ("id" uuid not null, "name" varchar(255) not null, "category" text not null, "amount" bigint not null, "expense_date" date not null, "supplier_id" uuid null, "status" text not null, "payment_method" text null, "note" text null, "created_by" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, primary key ("id"));`,
    );

    this.addSql(
      `alter table "expenses" add constraint "expenses_supplier_id_foreign" foreign key ("supplier_id") references "suppliers" ("id") on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table "expenses" add constraint "expenses_category_check" check ("category" in ('rent', 'utilities', 'salary', 'transport', 'marketing', 'office_supplies', 'other'));`,
    );
    this.addSql(
      `alter table "expenses" add constraint "expenses_status_check" check ("status" in ('pending', 'approved', 'paid', 'cancelled'));`,
    );
    this.addSql(
      `alter table "expenses" add constraint "expenses_payment_method_check" check ("payment_method" in ('cash', 'bank_transfer', 'card', 'other'));`,
    );
    this.addSql(
      `alter table "expenses" add constraint "expenses_amount_check" check ("amount" >= 0);`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "expenses" cascade;`);
  }
}

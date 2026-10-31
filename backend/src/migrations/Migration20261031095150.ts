import { Migration } from '@mikro-orm/migrations';

export class Migration20261031095150 extends Migration {

  override name = 'Migration20261031095150';

  override up(): void | Promise<void> {
    this.addSql(`create table "batches" ("id" uuid not null, "lot_number" varchar(255) not null, "product_id" uuid not null, "quantity" int not null, "unit_cost" numeric(12,2) not null, "status" text not null, "expired_at" date not null, "created_by" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, primary key ("id"));`);

    this.addSql(`alter table "batches" add constraint "batches_status_check" check ("status" in ('active', 'expired', 'out'));`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "batches" cascade;`);
  }

}

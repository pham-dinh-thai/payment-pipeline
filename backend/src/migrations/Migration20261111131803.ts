import { Migration } from '@mikro-orm/migrations';

export class Migration20261111131803 extends Migration {

  override name = 'Migration20261111131803';

  override up(): void | Promise<void> {
    this.addSql(`create table "outbox_events" ("id" serial primary key, "event_type" varchar(255) not null, "payload" jsonb not null, "created_at" timestamptz not null, "processed" boolean not null default false);`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "outbox_events" cascade;`);
  }

}

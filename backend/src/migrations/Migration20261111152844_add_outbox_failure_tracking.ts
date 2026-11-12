import { Migration } from '@mikro-orm/migrations';

export class Migration20261111152844_add_outbox_failure_tracking extends Migration {

  override name = 'Migration20261111152844_add_outbox_failure_tracking';

  override up(): void | Promise<void> {
    this.addSql(`alter table "outbox_events" add "attempts" int not null default 0, add "last_error" text null, add "failed_at" timestamptz null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "outbox_events" drop column "attempts", drop column "last_error", drop column "failed_at";`);
  }

}

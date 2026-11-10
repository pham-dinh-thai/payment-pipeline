import { Migration } from '@mikro-orm/migrations';

export class Migration20261110135500_add_outbox_events extends Migration {
  override name = 'Migration20261110135500_add_outbox_events';

  override up(): void | Promise<void> {
    this.addSql(
      `create table "outbox_events" ("id" uuid not null, "sequence" bigint generated always as identity not null, "event_type" varchar(200) not null, "event_version" int not null default 1, "aggregate_type" varchar(100) not null, "aggregate_id" varchar(255) not null, "payload" jsonb not null, "headers" jsonb not null default '{}'::jsonb, "occurred_at" timestamptz not null, "status" text not null default 'pending', "attempts" int not null default 0, "available_at" timestamptz not null default now(), "locked_at" timestamptz null, "locked_by" varchar(100) null, "processed_at" timestamptz null, "last_error" text null, "created_at" timestamptz not null default now(), constraint "outbox_events_pkey" primary key ("id"), constraint "outbox_events_sequence_key" unique ("sequence"), constraint "outbox_events_status_check" check ("status" in ('pending', 'processing', 'processed', 'failed')), constraint "outbox_events_attempts_check" check ("attempts" >= 0));`,
    );
    this.addSql(
      `create index "outbox_events_claim_idx" on "outbox_events" ("available_at", "sequence") where "status" = 'pending';`,
    );
    this.addSql(
      `create index "outbox_events_aggregate_idx" on "outbox_events" ("aggregate_type", "aggregate_id", "sequence");`,
    );
    this.addSql(
      `create index "outbox_events_processing_idx" on "outbox_events" ("locked_at") where "status" = 'processing';`,
    );
    this.addSql(
      `create index "outbox_events_cleanup_idx" on "outbox_events" ("processed_at") where "status" = 'processed';`,
    );
    this.addSql(
      `comment on table "outbox_events" is 'Transactional outbox. Assumes exactly one consumer per event; add a delivery table before supporting multiple consumers per event.';`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "outbox_events" cascade;`);
  }
}

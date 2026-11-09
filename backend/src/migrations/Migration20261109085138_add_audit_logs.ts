import { Migration } from '@mikro-orm/migrations';

export class Migration20261109085138_add_audit_logs extends Migration {
  override name = 'Migration20261109085138_add_audit_logs';

  override up(): void | Promise<void> {
    this.addSql(
      `create table "audit_logs" ("id" uuid not null, "occurred_at" timestamptz not null, "actor_id" uuid null, "actor_type" text not null, "actor_label" varchar(255) null, "action" varchar(100) not null, "entity_type" text null, "entity_id" varchar(255) null, "status" text not null, "before" jsonb null, "after" jsonb null, "metadata" jsonb not null default '{}', "ip_address" varchar(45) null, "user_agent" varchar(512) null, "request_id" varchar(100) null, "reason" varchar(1000) null, "error_code" varchar(100) null, "error_message" varchar(2000) null, primary key ("id"));`,
    );
    this.addSql(
      `create index "audit_logs_occurred_at_idx" on "audit_logs" ("occurred_at");`,
    );
    this.addSql(
      `create index "audit_logs_actor_idx" on "audit_logs" ("actor_id");`,
    );
    this.addSql(
      `create index "audit_logs_entity_idx" on "audit_logs" ("entity_type", "entity_id");`,
    );

    this.addSql(
      `alter table "audit_logs" add constraint "audit_logs_actor_type_check" check ("actor_type" in ('user', 'system'));`,
    );
    this.addSql(
      `alter table "audit_logs" add constraint "audit_logs_entity_type_check" check ("entity_type" in ('accounts', 'users', 'customers', 'roles', 'orders'));`,
    );
    this.addSql(
      `alter table "audit_logs" add constraint "audit_logs_status_check" check ("status" in ('success', 'failed', 'timeout'));`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "audit_logs" cascade;`);
  }
}

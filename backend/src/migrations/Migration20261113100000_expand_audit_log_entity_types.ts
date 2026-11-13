import { Migration } from '@mikro-orm/migrations';

export class Migration20261113100000_expand_audit_log_entity_types extends Migration {
  override name = 'Migration20261113100000_expand_audit_log_entity_types';

  override up(): void | Promise<void> {
    this.addSql(
      `alter table "audit_logs" drop constraint "audit_logs_entity_type_check";`,
    );
    this.addSql(
      `alter table "audit_logs" add constraint "audit_logs_entity_type_check" check ("entity_type" in ('accounts', 'users', 'customers', 'roles', 'orders', 'products', 'suppliers', 'goods_receipts', 'inventories'));`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(
      `alter table "audit_logs" drop constraint "audit_logs_entity_type_check";`,
    );
    this.addSql(
      `alter table "audit_logs" add constraint "audit_logs_entity_type_check" check ("entity_type" in ('accounts', 'users', 'customers', 'roles', 'orders'));`,
    );
  }
}

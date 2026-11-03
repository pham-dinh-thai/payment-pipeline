import { Migration } from '@mikro-orm/migrations';

export class Migration20261102065254 extends Migration {
  override name = 'Migration20261102065254';

  override up(): void | Promise<void> {
    this.addSql(
      `alter table "suppliers" drop constraint "suppliers_address_unique";`,
    );
    this.addSql(
      `alter table "suppliers" drop constraint "suppliers_email_unique";`,
    );
    this.addSql(
      `alter table "suppliers" drop constraint "suppliers_phone_unique";`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(
      `alter table "suppliers" add constraint "suppliers_address_unique" unique ("address");`,
    );
    this.addSql(
      `alter table "suppliers" add constraint "suppliers_email_unique" unique ("email");`,
    );
    this.addSql(
      `alter table "suppliers" add constraint "suppliers_phone_unique" unique ("phone");`,
    );
  }
}

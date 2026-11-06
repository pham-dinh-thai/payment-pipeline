import { Migration } from '@mikro-orm/migrations';

export class Migration20261106185109 extends Migration {

  override name = 'Migration20261106185109';

  override up(): void | Promise<void> {
    this.addSql(`alter table "customers" drop constraint "customers_pkey";`);
    this.addSql(`alter table "customers" add primary key ("id", "user_id");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "customers" drop constraint "customers_pkey";`);
    this.addSql(`alter table "customers" add primary key ("id");`);
  }

}

import { Migration } from '@mikro-orm/migrations';

export class Migration20261106191203 extends Migration {

  override name = 'Migration20261106191203';

  override up(): void | Promise<void> {
    this.addSql(`alter table "accounts" drop constraint "accounts_pkey";`);
    this.addSql(`alter table "accounts" add primary key ("id", "user_id");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "accounts" drop constraint "accounts_pkey";`);
    this.addSql(`alter table "accounts" add primary key ("id");`);
  }

}

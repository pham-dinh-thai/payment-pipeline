import { Migration } from '@mikro-orm/migrations';

export class Migration20261106184742 extends Migration {

  override name = 'Migration20261106184742';

  override up(): void | Promise<void> {
    this.addSql(`alter table "customers" add "user_id" varchar(255) not null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "customers" drop column "user_id";`);
  }

}

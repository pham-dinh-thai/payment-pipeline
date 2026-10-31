import { Migration } from '@mikro-orm/migrations';

export class Migration20261031105402 extends Migration {

  override name = 'Migration20261031105402';

  override up(): void | Promise<void> {
    this.addSql(`alter table "batches" rename column "expired_at" to "expires_at";`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "batches" rename column "expires_at" to "expired_at";`);
  }

}

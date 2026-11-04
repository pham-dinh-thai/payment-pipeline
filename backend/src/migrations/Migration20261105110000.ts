import { Migration } from '@mikro-orm/migrations';

export class Migration20261105110000 extends Migration {
  override name = 'Migration20261105110000';

  override up(): void | Promise<void> {
    this.addSql(
      `alter table "goods_receipts" add "confirmed_by" uuid null, add "confirmed_at" timestamptz null, add "cancelled_by" uuid null, add "cancelled_at" timestamptz null;`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(
      `alter table "goods_receipts" drop column "confirmed_by", drop column "confirmed_at", drop column "cancelled_by", drop column "cancelled_at";`,
    );
  }
}

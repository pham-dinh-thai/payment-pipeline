import { Migration } from '@mikro-orm/migrations';

export class Migration20261028085242 extends Migration {
  override name = 'Migration20261028085242';

  override up(): void | Promise<void> {
    this.addSql(
      `alter table "products" add "name" varchar(255) not null, add "unit_price" numeric(12,2) not null, add "quantity" int not null;`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(
      `alter table "products" drop column "name", drop column "unit_price", drop column "quantity";`,
    );
  }
}

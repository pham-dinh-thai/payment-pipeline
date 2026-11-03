import { Migration } from '@mikro-orm/migrations';

export class Migration20261103124645 extends Migration {
  override name = 'Migration20261103124645';

  override up(): void | Promise<void> {
    this.addSql(`create sequence "supplier_code_seq";`);
    this.addSql(
      `select setval('supplier_code_seq', coalesce((select max(substring("code" from '([0-9]+)$')::int) from "suppliers"), 0) + 1, false);`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`drop sequence if exists "supplier_code_seq";`);
  }
}

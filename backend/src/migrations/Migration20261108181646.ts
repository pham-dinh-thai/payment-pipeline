import { Migration } from '@mikro-orm/migrations';

export class Migration20261108181646 extends Migration {
  override name = 'Migration20261108181646';

  override up(): void | Promise<void> {
    this.addSql(
      `alter table "users" add "role_ids" text[] not null default '{}';`,
    );
    this.addSql(
      `create index "users_role_ids_gin" on "users" using gin ("role_ids");`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`drop index "users_role_ids_gin";`);
    this.addSql(`alter table "users" drop column "role_ids";`);
  }
}

import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

@Entity({ tableName: 'accounts' })
export class MikroAccount {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @PrimaryKey({ fieldName: 'user_id', type: 'string' })
  userId!: string;

  @Property({ type: 'string' })
  password!: string;

  @Property({ type: 'boolean' })
  isActive!: boolean;

  @Property({
    type: 'timestamptz',
    fieldName: 'created_at',
    onCreate: () => new Date(),
  })
  createdAt = new Date();

  @Property({
    type: 'timestamptz',
    fieldName: 'updated_at',
    onCreate: () => new Date(),
    onUpdate: () => new Date(),
  })
  updatedAt = new Date();
}

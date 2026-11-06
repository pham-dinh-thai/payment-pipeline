import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

@Entity({ tableName: 'users' })
export class MikroUser {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ fieldName: 'first_name', type: 'string' })
  firstName!: string;

  @Property({ fieldName: 'last_name', type: 'string' })
  lastName!: string;

  @Property({ unique: true, type: 'string' })
  email!: string;

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

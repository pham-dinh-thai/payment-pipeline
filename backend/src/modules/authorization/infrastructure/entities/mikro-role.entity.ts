import {
  Entity,
  Index,
  PrimaryKey,
  Property,
} from '@mikro-orm/decorators/legacy';

@Entity({ tableName: 'roles' })
@Index({
  name: 'roles_permissions_gin',
  properties: 'permissions',
  type: 'gin',
})
export class MikroRole {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'string', unique: true })
  name!: string;

  @Property({ type: 'array' })
  permissions: string[] = [];

  @Property({ fieldName: 'is_super_admin', type: 'boolean' })
  isSuperAdmin = false;

  @Property({ version: true, type: 'integer' })
  version!: number;

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

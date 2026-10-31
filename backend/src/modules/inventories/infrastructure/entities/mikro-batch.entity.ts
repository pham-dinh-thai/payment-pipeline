import {
  Entity,
  Enum,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/decorators/legacy';
import { BatchStatus } from '../../domain/batch/batch-status.enum';

@Entity({ tableName: 'batches' })
@Unique({ properties: ['productId', 'lotNumber'] })
export class MikroBatch {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ fieldName: 'lot_number', type: 'string' })
  lotNumber!: string;

  @Property({ fieldName: 'product_id', type: 'uuid' })
  productId!: string;

  @Property({ type: 'int' })
  quantity!: number;

  @Property({
    fieldName: 'unit_cost',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  unitCost!: string;

  @Enum(() => BatchStatus)
  status!: BatchStatus;

  @Property({ fieldName: 'expires_at', type: 'date' })
  expiresAt!: Date;

  @Property({ fieldName: 'created_by', type: 'uuid' })
  createdBy!: string;

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

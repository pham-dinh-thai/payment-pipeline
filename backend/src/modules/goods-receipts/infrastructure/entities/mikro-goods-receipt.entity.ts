import {
  Entity,
  Enum,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/decorators/legacy';
import { GoodsReceiptStatus } from '../../domain/goods-receipt-status.enum';
import { MikroSupplier } from '../../../suppliers/infrastructure/entities/mikro-supplier.entity';

@Entity({ tableName: 'goods_receipts' })
export class MikroGoodsReceipt {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'string', unique: true })
  code!: string;

  @ManyToOne(() => MikroSupplier, {
    fieldName: 'supplier_id',
    mapToPk: true,
    updateRule: 'cascade',
    deleteRule: 'no action',
  })
  supplierId!: string;

  @Enum(() => GoodsReceiptStatus)
  status!: GoodsReceiptStatus;

  @Property({ fieldName: 'created_by', type: 'uuid' })
  createdBy!: string;

  @Property({ fieldName: 'confirmed_by', type: 'uuid', nullable: true })
  confirmedBy!: string | null;

  @Property({ fieldName: 'confirmed_at', type: 'timestamptz', nullable: true })
  confirmedAt!: Date | null;

  @Property({ fieldName: 'cancelled_by', type: 'uuid', nullable: true })
  cancelledBy!: string | null;

  @Property({ fieldName: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt!: Date | null;

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

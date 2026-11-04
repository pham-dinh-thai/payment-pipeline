import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/decorators/legacy';
import { MikroProduct } from '../../../products/infrastructure/entities/mikro-product.entity';

@Entity({ tableName: 'goods_receipt_lines' })
@Unique({ properties: ['goodsReceiptId', 'productId', 'lotNumber'] })
export class MikroGoodsReceiptLine {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ fieldName: 'goods_receipt_id', type: 'uuid' })
  goodsReceiptId!: string;

  @ManyToOne(() => MikroProduct, {
    fieldName: 'product_id',
    mapToPk: true,
    updateRule: 'cascade',
    deleteRule: 'no action',
  })
  productId!: string;

  @Property({ fieldName: 'lot_number', type: 'string' })
  lotNumber!: string;

  @Property({ type: 'int' })
  quantity!: number;

  @Property({
    fieldName: 'unit_cost',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  unitCost!: string;

  @Property({ fieldName: 'expires_at', type: 'date' })
  expiresAt!: Date;

  @Property({ fieldName: 'batch_id', type: 'uuid', nullable: true })
  batchId!: string | null;

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

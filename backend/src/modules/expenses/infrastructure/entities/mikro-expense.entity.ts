import {
  Entity,
  Enum,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/decorators/legacy';
import { MikroSupplier } from '../../../suppliers/infrastructure/entities/mikro-supplier.entity';
import { ExpenseCategory } from '../../domain/enums/expense-category.enum';
import { ExpenseStatus } from '../../domain/enums/expense-status.enum';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';

@Entity({ tableName: 'expenses' })
export class MikroExpense {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'string' })
  name!: string;

  @Enum(() => ExpenseCategory)
  category!: ExpenseCategory;

  @Property({ type: 'bigint' })
  amount!: bigint;

  @Property({ fieldName: 'expense_date', type: 'date' })
  expenseDate!: Date;

  @ManyToOne(() => MikroSupplier, {
    fieldName: 'supplier_id',
    mapToPk: true,
    nullable: true,
    updateRule: 'cascade',
    deleteRule: 'set null',
  })
  supplierId!: string | null;

  @Enum(() => ExpenseStatus)
  status!: ExpenseStatus;

  @Enum({ items: () => PaymentMethod, nullable: true })
  paymentMethod!: PaymentMethod | null;

  @Property({ type: 'text', nullable: true })
  note!: string | null;

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

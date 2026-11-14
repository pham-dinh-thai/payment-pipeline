import { UnprocessableEntityException } from '@nestjs/common';
import { Id } from '../../../shared/value-objects/id.value-object';
import { Money } from '../../../shared/value-objects/money.value-object';
import { ExpenseCategory } from './enums/expense-category.enum';
import { ExpenseStatus } from './enums/expense-status.enum';
import { PaymentMethod } from './enums/payment-method.enum';

export type CreateExpenseProps = {
  name: string;
  category: ExpenseCategory;
  amount: string;
  expenseDate: Date;
  supplierId: string | null;
  paymentMethod: PaymentMethod | null;
  note: string | null;
  createdBy: string;
};

export type FromPersistentExpenseProps = CreateExpenseProps & {
  id: string;
  status: ExpenseStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateExpenseProps = {
  name: string;
  category: ExpenseCategory;
  amount: string;
  expenseDate: Date;
  supplierId: string | null;
  paymentMethod: PaymentMethod | null;
  note: string | null;
};

export class Expense {
  private constructor(
    private readonly id: Id,
    private name: string,
    private category: ExpenseCategory,
    private amount: Money,
    private expenseDate: Date,
    private supplierId: string | null,
    private status: ExpenseStatus,
    private paymentMethod: PaymentMethod | null,
    private note: string | null,
    private readonly createdBy: string,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  public static create(props: CreateExpenseProps): Expense {
    const now = new Date();

    return new Expense(
      Id.generate(),
      Expense.name(props.name),
      props.category,
      Money.create(props.amount),
      Expense.date(props.expenseDate),
      props.supplierId,
      ExpenseStatus.PENDING,
      props.paymentMethod,
      props.note,
      props.createdBy,
      now,
      now,
    );
  }

  public static fromPersistent(props: FromPersistentExpenseProps): Expense {
    return new Expense(
      Id.create(props.id),
      Expense.name(props.name),
      props.category,
      Money.create(props.amount),
      Expense.date(props.expenseDate),
      props.supplierId,
      props.status,
      props.paymentMethod,
      props.note,
      props.createdBy,
      props.createdAt,
      props.updatedAt,
    );
  }

  public update(props: UpdateExpenseProps): void {
    if (this.status !== ExpenseStatus.PENDING) {
      throw new UnprocessableEntityException(
        'Only pending expenses can be updated',
      );
    }

    this.name = Expense.name(props.name);
    this.category = props.category;
    this.amount = Money.create(props.amount);
    this.expenseDate = Expense.date(props.expenseDate);
    this.supplierId = props.supplierId;
    this.paymentMethod = props.paymentMethod;
    this.note = props.note;
    this.updatedAt = new Date();
  }

  public approve(): void {
    if (this.status !== ExpenseStatus.PENDING) {
      throw new UnprocessableEntityException(
        'Only pending expenses can be approved',
      );
    }

    this.status = ExpenseStatus.APPROVED;
    this.updatedAt = new Date();
  }

  public pay(): void {
    if (this.status !== ExpenseStatus.APPROVED) {
      throw new UnprocessableEntityException(
        'Only approved expenses can be paid',
      );
    }

    this.status = ExpenseStatus.PAID;
    this.updatedAt = new Date();
  }

  public cancel(): void {
    if (this.status === ExpenseStatus.PAID) {
      throw new UnprocessableEntityException(
        'Paid expenses can not be cancelled',
      );
    }

    if (this.status === ExpenseStatus.CANCELLED) {
      throw new UnprocessableEntityException('Expense is already cancelled');
    }

    this.status = ExpenseStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  public getId(): string {
    return this.id.getValue();
  }

  public getName(): string {
    return this.name;
  }

  public getCategory(): ExpenseCategory {
    return this.category;
  }

  public getAmount(): string {
    return this.amount.toString();
  }

  public getExpenseDate(): Date {
    return new Date(this.expenseDate);
  }

  public getSupplierId(): string | null {
    return this.supplierId;
  }

  public getStatus(): ExpenseStatus {
    return this.status;
  }

  public getPaymentMethod(): PaymentMethod | null {
    return this.paymentMethod;
  }

  public getNote(): string | null {
    return this.note;
  }

  public getCreatedBy(): string {
    return this.createdBy;
  }

  public getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  public getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }

  private static name(raw: string): string {
    const name = raw.trim();

    if (!name) {
      throw new UnprocessableEntityException('Expense name is required');
    }

    return name;
  }

  private static date(raw: Date): Date {
    const date = new Date(raw);

    if (Number.isNaN(date.getTime())) {
      throw new UnprocessableEntityException('Invalid expense date');
    }

    return date;
  }
}

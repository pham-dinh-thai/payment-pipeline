import { UnprocessableEntityException } from '@nestjs/common';
import { Expense } from './expense.aggregate';
import { ExpenseCategory } from './enums/expense-category.enum';
import { ExpenseStatus } from './enums/expense-status.enum';
import { PaymentMethod } from './enums/payment-method.enum';

const EXPENSE_DATE = new Date('2026-11-01T00:00:00.000Z');
const CREATED_BY = '0b6f0f4e-5e1a-4f36-9a4f-2f5a6b7c8d9e';

const createExpense = (
  overrides: Partial<Parameters<typeof Expense.create>[0]> = {},
): Expense =>
  Expense.create({
    name: 'Office rent',
    category: ExpenseCategory.RENT,
    amount: '5000000',
    expenseDate: EXPENSE_DATE,
    supplierId: null,
    paymentMethod: null,
    note: null,
    createdBy: CREATED_BY,
    ...overrides,
  });

describe('Expense', () => {
  describe('create', () => {
    it('creates a pending expense', () => {
      const expense = createExpense();

      expect(expense.getId()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(expense.getName()).toBe('Office rent');
      expect(expense.getCategory()).toBe(ExpenseCategory.RENT);
      expect(expense.getAmount()).toBe('5000000');
      expect(expense.getExpenseDate()).toEqual(EXPENSE_DATE);
      expect(expense.getSupplierId()).toBeNull();
      expect(expense.getStatus()).toBe(ExpenseStatus.PENDING);
      expect(expense.getPaymentMethod()).toBeNull();
      expect(expense.getNote()).toBeNull();
      expect(expense.getCreatedBy()).toBe(CREATED_BY);
    });

    it('trims the name', () => {
      expect(createExpense({ name: '  Utilities  ' }).getName()).toBe(
        'Utilities',
      );
    });

    it('rejects an empty name', () => {
      expect(() => createExpense({ name: '   ' })).toThrow(
        'Expense name is required',
      );
    });

    it('rejects a negative amount', () => {
      expect(() => createExpense({ amount: '-1' })).toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('fromPersistent', () => {
    it('restores all fields', () => {
      const expense = Expense.fromPersistent({
        id: 'b3d7f2a8-7a0e-4f1c-9c1a-4d3f5e6a7b8c',
        name: 'Utilities',
        category: ExpenseCategory.UTILITIES,
        amount: '250000',
        expenseDate: EXPENSE_DATE,
        supplierId: '2c7c7a2e-6f5a-4b4b-8a3e-1c9d2e3f4a5b',
        status: ExpenseStatus.APPROVED,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        note: 'October bill',
        createdBy: CREATED_BY,
        createdAt: new Date('2026-11-01T10:00:00.000Z'),
        updatedAt: new Date('2026-11-02T10:00:00.000Z'),
      });

      expect(expense.getId()).toBe('b3d7f2a8-7a0e-4f1c-9c1a-4d3f5e6a7b8c');
      expect(expense.getStatus()).toBe(ExpenseStatus.APPROVED);
      expect(expense.getPaymentMethod()).toBe(PaymentMethod.BANK_TRANSFER);
      expect(expense.getNote()).toBe('October bill');
      expect(expense.getUpdatedAt()).toEqual(
        new Date('2026-11-02T10:00:00.000Z'),
      );
    });
  });

  describe('update', () => {
    it('updates a pending expense', () => {
      const expense = createExpense();

      expense.update({
        name: 'New office rent',
        category: ExpenseCategory.OTHER,
        amount: '6000000',
        expenseDate: new Date('2026-11-05T00:00:00.000Z'),
        supplierId: null,
        paymentMethod: PaymentMethod.CASH,
        note: 'adjusted',
      });

      expect(expense.getName()).toBe('New office rent');
      expect(expense.getCategory()).toBe(ExpenseCategory.OTHER);
      expect(expense.getAmount()).toBe('6000000');
      expect(expense.getPaymentMethod()).toBe(PaymentMethod.CASH);
      expect(expense.getNote()).toBe('adjusted');
    });

    it('rejects updating a non-pending expense', () => {
      const expense = createExpense();
      expense.approve();

      expect(() =>
        expense.update({
          name: 'New office rent',
          category: ExpenseCategory.OTHER,
          amount: '6000000',
          expenseDate: EXPENSE_DATE,
          supplierId: null,
          paymentMethod: null,
          note: null,
        }),
      ).toThrow('Only pending expenses can be updated');
    });
  });

  describe('approve', () => {
    it('approves a pending expense', () => {
      const expense = createExpense();

      expense.approve();

      expect(expense.getStatus()).toBe(ExpenseStatus.APPROVED);
    });

    it('rejects approving a non-pending expense', () => {
      const expense = createExpense();
      expense.approve();

      expect(() => expense.approve()).toThrow(
        'Only pending expenses can be approved',
      );
    });
  });

  describe('pay', () => {
    it('pays an approved expense', () => {
      const expense = createExpense();
      expense.approve();

      expense.pay();

      expect(expense.getStatus()).toBe(ExpenseStatus.PAID);
    });

    it('rejects paying a pending expense', () => {
      const expense = createExpense();

      expect(() => expense.pay()).toThrow('Only approved expenses can be paid');
    });
  });

  describe('cancel', () => {
    it('cancels a pending expense', () => {
      const expense = createExpense();

      expense.cancel();

      expect(expense.getStatus()).toBe(ExpenseStatus.CANCELLED);
    });

    it('rejects cancelling a paid expense', () => {
      const expense = createExpense();
      expense.approve();
      expense.pay();

      expect(() => expense.cancel()).toThrow(
        'Paid expenses can not be cancelled',
      );
    });

    it('rejects cancelling twice', () => {
      const expense = createExpense();
      expense.cancel();

      expect(() => expense.cancel()).toThrow('Expense is already cancelled');
    });
  });
});

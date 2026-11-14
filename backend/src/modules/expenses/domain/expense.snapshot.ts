import { Expense } from './expense.aggregate';

/**
 * Snapshot of an expense for audit logging. Handlers decide which parts
 * (before/after) end up in the audit envelope.
 */
export const expenseSnapshot = (expense: Expense) => ({
  name: expense.getName(),
  category: expense.getCategory(),
  amount: expense.getAmount(),
  expenseDate: expense.getExpenseDate().toISOString().slice(0, 10),
  supplierId: expense.getSupplierId(),
  status: expense.getStatus(),
  paymentMethod: expense.getPaymentMethod(),
  note: expense.getNote(),
  createdBy: expense.getCreatedBy(),
});

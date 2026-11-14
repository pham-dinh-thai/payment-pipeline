import { Expense } from '../../domain/expense.aggregate';
import { MikroExpense } from '../entities/mikro-expense.entity';

export class ExpenseMapper {
  public static toDomain(mikroExpense: MikroExpense): Expense {
    return Expense.fromPersistent({
      id: mikroExpense.id,
      name: mikroExpense.name,
      category: mikroExpense.category,
      amount: mikroExpense.amount.toString(),
      expenseDate: new Date(mikroExpense.expenseDate),
      supplierId: mikroExpense.supplierId,
      status: mikroExpense.status,
      paymentMethod: mikroExpense.paymentMethod,
      note: mikroExpense.note,
      createdBy: mikroExpense.createdBy,
      createdAt: mikroExpense.createdAt,
      updatedAt: mikroExpense.updatedAt,
    });
  }

  public static toMikro(expense: Expense): MikroExpense {
    return ExpenseMapper.assign(new MikroExpense(), expense);
  }

  public static assign(
    mikroExpense: MikroExpense,
    expense: Expense,
  ): MikroExpense {
    mikroExpense.id = expense.getId();
    mikroExpense.name = expense.getName();
    mikroExpense.category = expense.getCategory();
    mikroExpense.amount = BigInt(expense.getAmount());
    mikroExpense.expenseDate = expense.getExpenseDate();
    mikroExpense.supplierId = expense.getSupplierId();
    mikroExpense.status = expense.getStatus();
    mikroExpense.paymentMethod = expense.getPaymentMethod();
    mikroExpense.note = expense.getNote();
    mikroExpense.createdBy = expense.getCreatedBy();
    mikroExpense.createdAt = expense.getCreatedAt();
    mikroExpense.updatedAt = expense.getUpdatedAt();

    return mikroExpense;
  }
}

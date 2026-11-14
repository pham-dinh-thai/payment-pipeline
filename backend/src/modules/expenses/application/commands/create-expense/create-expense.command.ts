import { Command } from '@nestjs/cqrs';
import { type ActorHeaders } from '../../../../../shared/types/actor-headers';
import { ExpenseCategory } from '../../../domain/enums/expense-category.enum';
import { PaymentMethod } from '../../../domain/enums/payment-method.enum';

export class CreateExpenseCommand extends Command<{ id: string }> {
  public constructor(
    public readonly name: string,
    public readonly category: ExpenseCategory,
    public readonly amount: string,
    public readonly expenseDate: Date,
    public readonly supplierId: string | null,
    public readonly paymentMethod: PaymentMethod | null,
    public readonly note: string | null,
    public readonly createdBy: string,
    public readonly headers: ActorHeaders,
  ) {
    super();
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  type IExpensesRepository,
  EXPENSES_REPOSITORY,
} from '../../../domain/expenses.repository';
import { Expense } from '../../../domain/expense.aggregate';
import { expenseSnapshot } from '../../../domain/expense.snapshot';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/modules/unit-of-work/unit-of-work';
import {
  type IOutboxRepository,
  OUTBOX_REPOSITORY,
} from '../../../../../shared/modules/outbox/domain/outbox.repository';
import { CreateExpenseCommand } from './create-expense.command';
import { EXPENSE_CREATED_EVENT } from '../../../domain/events/expense-created.event';
import { auditEventPayload } from '../../../../audit-logs/domain/events/audit-event.payload';
import { EntityType } from '../../../../audit-logs/domain/enums/entity-type.enum';

@CommandHandler(CreateExpenseCommand)
export class CreateExpenseHandler implements ICommandHandler<CreateExpenseCommand> {
  public constructor(
    @Inject(EXPENSES_REPOSITORY)
    private readonly expensesRepository: IExpensesRepository,

    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepository: IOutboxRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public execute(command: CreateExpenseCommand): Promise<{ id: string }> {
    return this.unitOfWork.run(async () => {
      const expense = Expense.create({
        name: command.name,
        category: command.category,
        amount: command.amount,
        expenseDate: command.expenseDate,
        supplierId: command.supplierId,
        paymentMethod: command.paymentMethod,
        note: command.note,
        createdBy: command.createdBy,
      });

      await this.expensesRepository.create(expense);

      await this.outboxRepository.create({
        eventType: EXPENSE_CREATED_EVENT,
        payload: auditEventPayload(command.headers, {
          entityType: EntityType.EXPENSES,
          entityId: expense.getId(),
          after: expenseSnapshot(expense),
        }),
      });

      return { id: expense.getId() };
    });
  }
}

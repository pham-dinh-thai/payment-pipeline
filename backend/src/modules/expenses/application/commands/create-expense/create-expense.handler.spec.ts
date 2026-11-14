import { describe, expect, it, jest } from '@jest/globals';
import { UnprocessableEntityException } from '@nestjs/common';
import { Expense } from '../../../domain/expense.aggregate';
import { ExpenseCategory } from '../../../domain/enums/expense-category.enum';
import { ExpenseStatus } from '../../../domain/enums/expense-status.enum';
import { PaymentMethod } from '../../../domain/enums/payment-method.enum';
import { EXPENSE_CREATED_EVENT } from '../../../domain/events/expense-created.event';
import { EntityType } from '../../../../audit-logs/domain/enums/entity-type.enum';
import { IExpensesRepository } from '../../../domain/expenses.repository';
import { IOutboxRepository } from '../../../../../shared/modules/outbox/domain/outbox.repository';
import { IUnitOfWork } from '../../../../../shared/modules/unit-of-work/unit-of-work';
import { CreateExpenseCommand } from './create-expense.command';
import { CreateExpenseHandler } from './create-expense.handler';

const EXPENSE_DATE = new Date('2026-11-01T00:00:00.000Z');
const CREATED_BY = '7d0d2c55-9a9d-4c7d-9f6a-3f7f5a1b2c3d';
const SUPPLIER_ID = '2c7c7a2e-6f5a-4b4b-8a3e-1c9d2e3f4a5b';

const headers = {
  actorId: CREATED_BY,
  actorType: 'user',
  actorLabel: 'admin@example.com',
  userIp: '127.0.0.1',
  userAgent: 'jest',
};

const createCommand = (amount = '5000000') =>
  new CreateExpenseCommand(
    'Office rent',
    ExpenseCategory.RENT,
    amount,
    EXPENSE_DATE,
    SUPPLIER_ID,
    PaymentMethod.BANK_TRANSFER,
    'November rent',
    CREATED_BY,
    headers,
  );

const setup = () => {
  const create = jest.fn<IExpensesRepository['create']>((expense) =>
    Promise.resolve(expense),
  );
  const run = jest.fn<IUnitOfWork['run']>((work) => work());
  const outboxCreate = jest
    .fn<IOutboxRepository['create']>()
    .mockResolvedValue(undefined);

  const repository: IExpensesRepository = {
    findAll: jest.fn<IExpensesRepository['findAll']>(),
    findById: jest.fn<IExpensesRepository['findById']>(),
    create,
    update: jest.fn<IExpensesRepository['update']>(),
  };
  const unitOfWork: IUnitOfWork = {
    run: run as unknown as IUnitOfWork['run'],
  };
  const handler = new CreateExpenseHandler(
    repository,
    { create: outboxCreate } as unknown as IOutboxRepository,
    unitOfWork,
  );

  return { handler, create, run, outboxCreate };
};

describe('CreateExpenseHandler', () => {
  it('creates an expense inside a unit of work and appends an audit event', async () => {
    const { handler, create, run, outboxCreate } = setup();

    const result = await handler.execute(createCommand());

    expect(result.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(run).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledTimes(1);

    const expense = create.mock.calls[0][0];

    expect(expense).toBeInstanceOf(Expense);
    expect(expense.getId()).toBe(result.id);
    expect(expense.getName()).toBe('Office rent');
    expect(expense.getCategory()).toBe(ExpenseCategory.RENT);
    expect(expense.getAmount()).toBe('5000000');
    expect(expense.getExpenseDate()).toEqual(EXPENSE_DATE);
    expect(expense.getSupplierId()).toBe(SUPPLIER_ID);
    expect(expense.getStatus()).toBe(ExpenseStatus.PENDING);
    expect(expense.getPaymentMethod()).toBe(PaymentMethod.BANK_TRANSFER);
    expect(expense.getNote()).toBe('November rent');
    expect(expense.getCreatedBy()).toBe(CREATED_BY);

    expect(outboxCreate).toHaveBeenCalledWith({
      eventType: EXPENSE_CREATED_EVENT,
      payload: {
        headers,
        audit: {
          entityType: EntityType.EXPENSES,
          entityId: expense.getId(),
          after: {
            name: 'Office rent',
            category: ExpenseCategory.RENT,
            amount: '5000000',
            expenseDate: '2026-11-01',
            supplierId: SUPPLIER_ID,
            status: ExpenseStatus.PENDING,
            paymentMethod: PaymentMethod.BANK_TRANSFER,
            note: 'November rent',
            createdBy: CREATED_BY,
          },
        },
      },
    });
  });

  it('does not persist an expense that violates a domain rule', async () => {
    const { handler, create, outboxCreate } = setup();

    await expect(handler.execute(createCommand('1.5'))).rejects.toThrow(
      UnprocessableEntityException,
    );

    expect(create).not.toHaveBeenCalled();
    expect(outboxCreate).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CommandBus } from '@nestjs/cqrs';
import { UnprocessableEntityException } from '@nestjs/common';
import { CreateExpenseCommand } from '../../application/commands/create-expense/create-expense.command';
import { ExpenseCategory } from '../../domain/enums/expense-category.enum';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';
import { ExpensesController } from './expenses.controller';
import { CreateExpenseRequest } from './requests/create-expense.request';

const EXPENSE_DATE = new Date('2026-11-01T00:00:00.000Z');
const SUPPLIER_ID = 'b3d7f2a8-7a0e-4f1c-9c1a-4d3f5e6a7b8c';

const headers = {
  actorId: '7d0d2c55-9a9d-4c7d-9f6a-3f7f5a1b2c3d',
  actorType: 'user',
  actorLabel: 'admin@example.com',
  userIp: '127.0.0.1',
  userAgent: 'jest',
};

const buildRequest = (): CreateExpenseRequest =>
  Object.assign(new CreateExpenseRequest(), {
    name: 'Office rent',
    category: ExpenseCategory.RENT,
    amount: '5000000',
    expenseDate: EXPENSE_DATE,
    supplierId: SUPPLIER_ID,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    note: 'November rent',
  });

describe('ExpensesController', () => {
  let execute: jest.Mock<
    (command: CreateExpenseCommand) => Promise<{ id: string }>
  >;
  let controller: ExpensesController;

  beforeEach(() => {
    execute = jest
      .fn<(command: CreateExpenseCommand) => Promise<{ id: string }>>()
      .mockResolvedValue({ id: 'expense-1' });

    controller = new ExpensesController({ execute } as unknown as CommandBus);
  });

  it('dispatches CreateExpenseCommand with actor headers and returns the created id', async () => {
    const result = await controller.create(buildRequest(), headers);

    expect(execute).toHaveBeenCalledTimes(1);

    const command = execute.mock.calls[0][0];
    expect(command).toBeInstanceOf(CreateExpenseCommand);
    expect(command).toMatchObject({
      name: 'Office rent',
      category: ExpenseCategory.RENT,
      amount: '5000000',
      expenseDate: EXPENSE_DATE,
      supplierId: SUPPLIER_ID,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      note: 'November rent',
      createdBy: headers.actorId,
      headers,
    });

    expect(result).toEqual({ id: 'expense-1' });
  });

  it('normalizes omitted optional fields to null', async () => {
    const request = buildRequest();
    request.supplierId = null;
    request.paymentMethod = null;
    request.note = null;

    await controller.create(request, headers);

    const command = execute.mock.calls[0][0];
    expect(command.supplierId).toBeNull();
    expect(command.paymentMethod).toBeNull();
    expect(command.note).toBeNull();
  });

  it('propagates command errors to the caller', async () => {
    const error = new UnprocessableEntityException('invalid expense');
    execute.mockRejectedValue(error);

    await expect(controller.create(buildRequest(), headers)).rejects.toBe(
      error,
    );

    expect(execute).toHaveBeenCalledTimes(1);
  });
});

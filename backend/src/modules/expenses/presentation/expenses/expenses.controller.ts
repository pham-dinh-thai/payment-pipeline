import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateExpenseCommand } from '../../application/commands/create-expense/create-expense.command';
import { CreateExpenseRequest } from './requests/create-expense.request';
import { AuthGuard } from '../../../../shared/modules/security/auth.guard';
import { PermissionsGuard } from '../../../../shared/modules/security/permissions.guard';
import { RequirePermissions } from '../../../../shared/modules/security/require-permissions.decorator';
import { ActorContext } from '../../../../shared/modules/security/actor-context.decorator';
import { type ActorHeaders } from '../../../../shared/types/actor-headers';

@Controller('expenses')
@UseGuards(AuthGuard, PermissionsGuard)
export class ExpensesController {
  private readonly logger = new Logger(ExpensesController.name);

  public constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @RequirePermissions(['expenses:create'])
  public async create(
    @Body() request: CreateExpenseRequest,
    @ActorContext() headers: ActorHeaders,
  ): Promise<{ id: string }> {
    const result = await this.commandBus.execute(
      new CreateExpenseCommand(
        request.name,
        request.category,
        request.amount,
        request.expenseDate,
        request.supplierId ?? null,
        request.paymentMethod ?? null,
        request.note ?? null,
        headers.actorId,
        headers,
      ),
    );

    this.logger.log('Expense created', result);

    return result;
  }
}

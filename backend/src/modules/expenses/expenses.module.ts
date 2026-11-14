import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EXPENSES_REPOSITORY } from './domain/expenses.repository';
import { MikroExpense } from './infrastructure/entities/mikro-expense.entity';
import { MikroExpensesRepository } from './infrastructure/repositories/mikro-expenses.repository';
import { CreateExpenseHandler } from './application/commands/create-expense/create-expense.handler';
import { OutBoxModule } from '../../shared/modules/outbox/outbox.module';
import { SecurityModule } from '../../shared/modules/security/security.module';
import { ExpensesController } from './presentation/expenses/expenses.controller';

@Module({
  imports: [
    MikroOrmModule.forFeature([MikroExpense]),
    OutBoxModule,
    SecurityModule,
  ],
  controllers: [ExpensesController],
  providers: [
    { provide: EXPENSES_REPOSITORY, useClass: MikroExpensesRepository },
    CreateExpenseHandler,
  ],
  exports: [EXPENSES_REPOSITORY],
})
export class ExpensesModule {}

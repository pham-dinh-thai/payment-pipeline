import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EXPENSES_REPOSITORY } from './domain/expenses.repository';
import { MikroExpense } from './infrastructure/entities/mikro-expense.entity';
import { MikroExpensesRepository } from './infrastructure/repositories/mikro-expenses.repository';

@Module({
  imports: [MikroOrmModule.forFeature([MikroExpense])],
  providers: [
    { provide: EXPENSES_REPOSITORY, useClass: MikroExpensesRepository },
  ],
  exports: [EXPENSES_REPOSITORY],
})
export class ExpensesModule {}

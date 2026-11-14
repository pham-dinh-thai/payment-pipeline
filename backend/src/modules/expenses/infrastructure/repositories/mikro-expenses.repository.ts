import { Injectable, NotFoundException } from '@nestjs/common';
import {
  EntityManager,
  ForeignKeyConstraintViolationException,
} from '@mikro-orm/core';
import { IExpensesRepository } from '../../domain/expenses.repository';
import { Expense } from '../../domain/expense.aggregate';
import { MikroExpense } from '../entities/mikro-expense.entity';
import { ExpenseMapper } from '../mappers/expense.mapper';

@Injectable()
export class MikroExpensesRepository implements IExpensesRepository {
  public constructor(private readonly entityManager: EntityManager) {}

  public async findAll(): Promise<Expense[]> {
    const mikroExpenses = await this.entityManager.findAll(MikroExpense, {
      orderBy: { expenseDate: 'desc', createdAt: 'desc' },
    });

    return mikroExpenses.map((mikroExpense) =>
      ExpenseMapper.toDomain(mikroExpense),
    );
  }

  public async findById(id: string): Promise<Expense | null> {
    const mikroExpense = await this.entityManager.findOne(MikroExpense, { id });

    return mikroExpense ? ExpenseMapper.toDomain(mikroExpense) : null;
  }

  public create(expense: Expense): Promise<Expense> {
    return this.persistExpense(new MikroExpense(), expense, true);
  }

  public update(expense: Expense): Promise<Expense> {
    const mikroExpense = this.entityManager.getReference(
      MikroExpense,
      expense.getId(),
    );

    return this.persistExpense(mikroExpense, expense, false);
  }

  private async persistExpense(
    mikroExpense: MikroExpense,
    expense: Expense,
    insert: boolean,
  ): Promise<Expense> {
    try {
      ExpenseMapper.assign(mikroExpense, expense);

      if (insert) {
        this.entityManager.persist(mikroExpense);
      }

      await this.entityManager.flush();

      return ExpenseMapper.toDomain(mikroExpense);
    } catch (e) {
      if (e instanceof ForeignKeyConstraintViolationException) {
        throw new NotFoundException('Supplier not found');
      }

      throw e;
    }
  }
}

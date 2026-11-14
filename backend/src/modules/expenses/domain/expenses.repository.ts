import { Expense } from './expense.aggregate';

export interface IExpensesRepository {
  findAll(): Promise<Expense[]>;

  findById(id: string): Promise<Expense | null>;

  create(expense: Expense): Promise<Expense>;

  update(expense: Expense): Promise<Expense>;
}

export const EXPENSES_REPOSITORY = 'IExpensesRepository';

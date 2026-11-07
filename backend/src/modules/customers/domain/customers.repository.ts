import { Customer } from './customer.aggregate';

export interface ICustomersRepository {
  existsByIdAndUserId(id: string, userId: string): Promise<boolean>;

  create(customer: Customer): Customer;
}

export const CUSTOMERS_REPOSITORY = 'ICustomersRepository';

import { Account } from './account.aggregate';

export interface IAccountsRepository {
  create(account: Account): Account;
}

export const ACCOUNTS_REPOSITORY = 'IAccountsRepository';

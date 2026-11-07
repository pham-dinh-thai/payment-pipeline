import { Account } from './account.aggregate';

export interface IAccountsRepository {
  findByUserIdOrFail(userId: string): Promise<Account>;

  create(account: Account): Account;
}

export const ACCOUNTS_REPOSITORY = 'IAccountsRepository';

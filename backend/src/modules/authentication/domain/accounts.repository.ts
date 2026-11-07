import { Account } from './account.aggregate';

export interface IAccountsRepository {
  findByUserId(userId: string): Promise<Account | null>;

  findByUserIdOrFail(userId: string): Promise<Account>;

  create(account: Account): Account;
}

export const ACCOUNTS_REPOSITORY = 'IAccountsRepository';

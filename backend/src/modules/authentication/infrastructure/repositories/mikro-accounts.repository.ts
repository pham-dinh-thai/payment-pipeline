import { Injectable } from '@nestjs/common';
import { IAccountsRepository } from '../../domain/accounts.repository';
import { EntityManager } from '@mikro-orm/postgresql';
import { Account } from '../../domain/account.aggregate';
import { AccountMapper } from '../mappers/account.mapper';

@Injectable()
export class MikroAccountsRepository implements IAccountsRepository {
  public constructor(private readonly entityManager: EntityManager) {}

  public create(account: Account): Account {
    const mikroAccount = AccountMapper.toMikroOrm(account);

    this.entityManager.insert(mikroAccount);

    return account;
  }
}

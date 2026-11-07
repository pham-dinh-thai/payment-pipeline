import { Injectable, NotFoundException } from '@nestjs/common';
import { IAccountsRepository } from '../../domain/accounts.repository';
import { EntityManager } from '@mikro-orm/postgresql';
import { Account } from '../../domain/account.aggregate';
import { AccountMapper } from '../mappers/account.mapper';
import { MikroAccount } from '../entities/mikro-account.entity';

@Injectable()
export class MikroAccountsRepository implements IAccountsRepository {
  public constructor(private readonly entityManager: EntityManager) {}

  public async findByUserIdOrFail(userId: string): Promise<Account> {
    const mikroAccount = await this.entityManager.findOne(MikroAccount, {
      userId,
    });

    if (!mikroAccount) {
      throw new NotFoundException(`Account with userId ${userId} not found`);
    }

    return AccountMapper.toDomain(mikroAccount);
  }

  public create(account: Account): Account {
    const mikroAccount = AccountMapper.toMikroOrm(account);

    this.entityManager.insert(mikroAccount);

    return account;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { IAccountsRepository } from '../../domain/accounts.repository';
import { EntityManager } from '@mikro-orm/postgresql';
import { Account } from '../../domain/account.aggregate';
import { AccountMapper } from '../mappers/account.mapper';
import { MikroAccount } from '../entities/mikro-account.entity';

@Injectable()
export class MikroAccountsRepository implements IAccountsRepository {
  public constructor(private readonly entityManager: EntityManager) {}

  public async findByUserId(userId: string): Promise<Account | null> {
    const mikroAccount = await this.entityManager.findOne(MikroAccount, {
      userId,
    });

    return mikroAccount ? AccountMapper.toDomain(mikroAccount) : null;
  }

  public async findByUserIdOrFail(userId: string): Promise<Account> {
    const account = await this.findByUserId(userId);

    if (!account) {
      throw new NotFoundException(`Account with userId ${userId} not found`);
    }

    return account;
  }

  public create(account: Account): Account {
    const mikroAccount = AccountMapper.toMikroOrm(account);

    this.entityManager.insert(mikroAccount);

    return account;
  }
}

import { Injectable } from '@nestjs/common';
import { ICustomersRepository } from '../../domain/customers.repository';
import { EntityManager } from '@mikro-orm/core';
import { Customer } from '../../domain/customer.aggregate';
import { CustomerMapper } from '../mappers/customer.mapper';
import { MikroCustomer } from '../entities/mikro-customer.entity';

@Injectable()
export class MikroCustomersRepository implements ICustomersRepository {
  public constructor(private readonly entityManager: EntityManager) {}

  public async existsByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<boolean> {
    const mikroCustomer = await this.entityManager.findOne(MikroCustomer, {
      id,
      userId,
    });

    return !!mikroCustomer;
  }

  public create(customer: Customer): Customer {
    const mikroCustomer = CustomerMapper.toMikroOrm(customer);

    this.entityManager.insert(mikroCustomer);

    return customer;
  }
}

import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { MikroCustomer } from './infrastructure/entities/mikro-customer.entity';
import { CUSTOMERS_REPOSITORY } from './domain/customers.repository';
import { MikroCustomersRepository } from './infrastructure/repositories/mikro-customers.repository';
import { CreateCustomerHandler } from './application/commands/create-customer/create-customer.handler';
import { UNIT_OF_WORK } from '../../shared/application/unit-of-work';
import { MikroUnitOfWork } from '../../shared/infrastructure/persistence/mikro-unit-of-work';

@Module({
  imports: [MikroOrmModule.forFeature([MikroCustomer])],
  providers: [
    { provide: CUSTOMERS_REPOSITORY, useClass: MikroCustomersRepository },
    { provide: UNIT_OF_WORK, useClass: MikroUnitOfWork },
    CreateCustomerHandler,
  ],
})
export class CustomersModule {}

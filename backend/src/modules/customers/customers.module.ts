import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { MikroCustomer } from './infrastructure/entities/mikro-customer.entity';
import { CUSTOMERS_REPOSITORY } from './domain/customers.repository';
import { MikroCustomersRepository } from './infrastructure/repositories/mikro-customers.repository';
import { CreateCustomerHandler } from './application/commands/create-customer/create-customer.handler';

@Module({
  imports: [MikroOrmModule.forFeature([MikroCustomer])],
  providers: [
    { provide: CUSTOMERS_REPOSITORY, useClass: MikroCustomersRepository },
    CreateCustomerHandler,
  ],
})
export class CustomersModule {}

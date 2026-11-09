import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCustomerCommand } from './create-customer.command';
import { ConflictException, Inject } from '@nestjs/common';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/modules/unit-of-work/unit-of-work';
import {
  CUSTOMERS_REPOSITORY,
  type ICustomersRepository,
} from '../../../domain/customers.repository';
import { Customer } from '../../../domain/customer.aggregate';

@CommandHandler(CreateCustomerCommand)
export class CreateCustomerHandler implements ICommandHandler<CreateCustomerCommand> {
  public constructor(
    @Inject(CUSTOMERS_REPOSITORY)
    private readonly customersRepository: ICustomersRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(
    command: CreateCustomerCommand,
  ): Promise<{ id: string }> {
    return this.unitOfWork.run(async () => {
      const customer = Customer.create(command.userId);

      if (
        await this.customersRepository.existsByIdAndUserId(
          customer.getId(),
          customer.getUserId(),
        )
      ) {
        throw new ConflictException(`Customer already exists`);
      }

      this.customersRepository.create(customer);

      return { id: customer.getId() };
    });
  }
}

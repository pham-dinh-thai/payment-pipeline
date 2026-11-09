import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterCommand } from './register.command';
import { CreateCustomerCommand } from '../../../../customers/application/commands/create-customer/create-customer.command';
import { Account } from '../../../domain/account.aggregate';
import { Inject } from '@nestjs/common';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/modules/unit-of-work/unit-of-work';
import {
  ACCOUNTS_REPOSITORY,
  type IAccountsRepository,
} from '../../../domain/accounts.repository';
import {
  CREATE_USER_PORT,
  type ICreateUserPort,
} from './ports/create-user.port';
import {
  CREATE_CUSTOMER_PORT,
  type ICreateCustomerPort,
} from './ports/create-customer.port';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  public constructor(
    @Inject(ACCOUNTS_REPOSITORY)
    private readonly accountsRepository: IAccountsRepository,

    @Inject(CREATE_USER_PORT)
    private readonly createUserPort: ICreateUserPort,

    @Inject(CREATE_CUSTOMER_PORT)
    private readonly createCustomerPort: ICreateCustomerPort,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(command: RegisterCommand): Promise<void> {
    return this.unitOfWork.run(async () => {
      const user = await this.createUserPort.execute({
        firstName: command.firstName,
        lastName: command.lastName,
        email: command.email,
      });

      await this.createCustomerPort.execute({ userId: user.id });

      const account = await Account.create({
        userId: user.id,
        password: command.password,
      });

      await this.accountsRepository.create(account);
    });
  }
}

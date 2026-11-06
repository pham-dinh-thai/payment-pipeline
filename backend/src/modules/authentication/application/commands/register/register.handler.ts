import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterCommand } from './register.command';
import { CreateUserCommand } from '../../../../users/application/commands/create-user/create-user.command';
import { CreateCustomerCommand } from '../../../../customers/application/commands/create-customer/create-customer.command';
import { Account } from '../../../domain/account.aggregate';
import { Inject } from '@nestjs/common';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/application/unit-of-work';
import {
  ACCOUNTS_REPOSITORY,
  type IAccountsRepository,
} from '../../../domain/accounts.repository';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  public constructor(
    private readonly commandBus: CommandBus,

    @Inject(ACCOUNTS_REPOSITORY)
    private readonly accountsRepository: IAccountsRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(command: RegisterCommand): Promise<void> {
    return this.unitOfWork.run(async () => {
      const user = await this.commandBus.execute(
        new CreateUserCommand(
          command.firstName,
          command.lastName,
          command.email,
        ),
      );

      await this.commandBus.execute(new CreateCustomerCommand(user.id));

      const account = await Account.create({
        userId: user.id,
        password: command.password,
      });

      await this.accountsRepository.create(account);
    });
  }
}

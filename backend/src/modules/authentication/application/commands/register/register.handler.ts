import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterCommand } from './register.command';
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
import {
  type IOutboxRepository,
  OUTBOX_REPOSITORY,
} from '../../../../../shared/modules/outbox/domain/outbox.repository';
import { ACCOUNT_SIGNED_UP_EVENT } from '../../../domain/events/account-signed-up.event';
import { accountEventPayload } from '../../../domain/events/account-event.payload';
import { ActorType } from '../../../../audit-logs/domain/enums/actor-type.enum';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  public constructor(
    @Inject(ACCOUNTS_REPOSITORY)
    private readonly accountsRepository: IAccountsRepository,

    @Inject(CREATE_USER_PORT)
    private readonly createUserPort: ICreateUserPort,

    @Inject(CREATE_CUSTOMER_PORT)
    private readonly createCustomerPort: ICreateCustomerPort,

    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepository: IOutboxRepository,

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

      await this.outboxRepository.create({
        eventType: ACCOUNT_SIGNED_UP_EVENT,
        payload: accountEventPayload(account, {
          actorId: user.id,
          actorType: ActorType.USER,
          actorLabel: command.email,
          userIp: command.ip,
          userAgent: command.userAgent,
        }),
      });
    });
  }
}

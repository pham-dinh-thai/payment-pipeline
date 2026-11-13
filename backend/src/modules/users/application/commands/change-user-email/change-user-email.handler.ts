import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangeUserEmailCommand } from './change-user-email.command';
import { ChangeUserEmailReadModel } from './change-user-email.read-model';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from '../../../domain/users.repository';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/modules/unit-of-work/unit-of-work';
import {
  type IOutboxRepository,
  OUTBOX_REPOSITORY,
} from '../../../../../shared/modules/outbox/domain/outbox.repository';
import { USER_EMAIL_CHANGED_EVENT } from '../../../domain/events/user-email-changed.event';
import { auditEventPayload } from '../../../../audit-logs/domain/events/audit-event.payload';
import { EntityType } from '../../../../audit-logs/domain/enums/entity-type.enum';

@CommandHandler(ChangeUserEmailCommand)
export class ChangeUserEmailHandler implements ICommandHandler<ChangeUserEmailCommand> {
  public constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,

    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepository: IOutboxRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(
    command: ChangeUserEmailCommand,
  ): Promise<ChangeUserEmailReadModel> {
    return this.unitOfWork.run(async () => {
      const user = await this.usersRepository.findById(command.id);

      if (!user) {
        throw new NotFoundException(`User with id ${command.id} not found`);
      }

      const previousEmail = user.getEmail();

      user.changeEmail(command.email);

      await this.usersRepository.update(user);

      await this.outboxRepository.create({
        eventType: USER_EMAIL_CHANGED_EVENT,
        payload: auditEventPayload(command.headers, {
          entityType: EntityType.USERS,
          entityId: user.getId(),
          before: { email: previousEmail },
          after: { email: user.getEmail() },
        }),
      });

      return new ChangeUserEmailReadModel(
        user.getId(),
        user.getFirstName(),
        user.getLastName(),
        user.getEmail(),
        user.getRoleIds(),
      );
    });
  }
}

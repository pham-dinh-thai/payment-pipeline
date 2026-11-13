import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateUserByAdminCommand } from './create-user-by-admin.command';
import { CreateUserService } from '../../services/create-user.service';
import {
  type IOutboxRepository,
  OUTBOX_REPOSITORY,
} from '../../../../../shared/modules/outbox/domain/outbox.repository';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/modules/unit-of-work/unit-of-work';
import { USER_CREATED_EVENT } from '../../../domain/events/user-created.event';
import { auditEventPayload } from '../../../../audit-logs/domain/events/audit-event.payload';
import { EntityType } from '../../../../audit-logs/domain/enums/entity-type.enum';

@CommandHandler(CreateUserByAdminCommand)
export class CreateUserByAdminHandler implements ICommandHandler<CreateUserByAdminCommand> {
  public constructor(
    private readonly createUserService: CreateUserService,

    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepository: IOutboxRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(
    command: CreateUserByAdminCommand,
  ): Promise<{ id: string }> {
    return this.unitOfWork.run(async () => {
      const user = await this.createUserService.create({
        firstName: command.firstName,
        lastName: command.lastName,
        email: command.email,
      });

      await this.outboxRepository.create({
        eventType: USER_CREATED_EVENT,
        payload: auditEventPayload(command.headers, {
          entityType: EntityType.USERS,
          entityId: user.getId(),
          after: {
            firstName: user.getFirstName(),
            lastName: user.getLastName(),
            email: user.getEmail(),
            roleIds: user.getRoleIds(),
          },
        }),
      });

      return { id: user.getId() };
    });
  }
}

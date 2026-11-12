import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  type IRolesRepository,
  ROLES_REPOSITORY,
} from '../../../domain/roles.repository';
import { Role } from '../../../domain/role.aggregate';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/modules/unit-of-work/unit-of-work';
import {
  type IOutboxRepository,
  OUTBOX_REPOSITORY,
} from '../../../../../shared/modules/outbox/domain/outbox.repository';
import { ROLE_CREATED_EVENT } from '../../../domain/events/role-created.event';
import { roleEventPayload } from '../../../domain/events/role-event.payload';
import { CreateRoleCommand } from './create-role.command';

@CommandHandler(CreateRoleCommand)
export class CreateRoleHandler implements ICommandHandler<CreateRoleCommand> {
  public constructor(
    @Inject(ROLES_REPOSITORY)
    private readonly rolesRepository: IRolesRepository,

    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepository: IOutboxRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public execute(command: CreateRoleCommand): Promise<{ id: string }> {
    return this.unitOfWork.run(async () => {
      const role = Role.create({
        name: command.name,
        permissions: command.permissions,
        isSuperAdmin: command.isSuperAdmin,
      });

      await this.rolesRepository.create(role);

      const payload = roleEventPayload(role, command.headers);

      await this.outboxRepository.create({
        eventType: ROLE_CREATED_EVENT,
        payload,
      });

      return { id: role.getId() };
    });
  }
}

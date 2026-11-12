import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  type IRolesRepository,
  ROLES_REPOSITORY,
} from '../../../domain/roles.repository';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/modules/unit-of-work/unit-of-work';
import { GrantPermissionCommand } from './grant-permission.command';
import {
  type IOutboxRepository,
  OUTBOX_REPOSITORY,
} from '../../../../../shared/modules/outbox/domain/outbox.repository';
import { PERMISSION_GRANTED_EVENT } from '../../../domain/events/permission-granted.event';
import { roleEventPayload } from '../../../domain/events/role-event.payload';

@CommandHandler(GrantPermissionCommand)
export class GrantPermissionHandler implements ICommandHandler<GrantPermissionCommand> {
  public constructor(
    @Inject(ROLES_REPOSITORY)
    private readonly rolesRepository: IRolesRepository,

    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepository: IOutboxRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(
    command: GrantPermissionCommand,
  ): Promise<{ id: string }> {
    return this.unitOfWork.run(async () => {
      const role = await this.rolesRepository.findById(command.id);

      if (!role) {
        throw new NotFoundException(`Role id ${command.id} not found`);
      }

      role.grant(command.permission);

      const payload = roleEventPayload(role, command.headers);

      await this.rolesRepository.update(role);

      await this.outboxRepository.create({
        eventType: PERMISSION_GRANTED_EVENT,
        payload,
      });

      return { id: role.getId() };
    });
  }
}

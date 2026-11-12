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
import { RenameRoleCommand } from './rename-role.command';
import {
  type IOutboxRepository,
  OUTBOX_REPOSITORY,
} from '../../../../../shared/modules/outbox/domain/outbox.repository';
import { ROLE_RENAMED_EVENT } from '../../../domain/events/role-renamed.event';
import { roleEventPayload } from '../../../domain/events/role-event.payload';

@CommandHandler(RenameRoleCommand)
export class RenameRoleHandler implements ICommandHandler<RenameRoleCommand> {
  public constructor(
    @Inject(ROLES_REPOSITORY)
    private readonly rolesRepository: IRolesRepository,

    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepository: IOutboxRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(command: RenameRoleCommand): Promise<{ id: string }> {
    return this.unitOfWork.run(async () => {
      const role = await this.rolesRepository.findById(command.id);

      if (!role) {
        throw new NotFoundException(`Role id ${command.id} not found`);
      }

      role.rename(command.name);

      await this.rolesRepository.update(role);

      await this.outboxRepository.create({
        eventType: ROLE_RENAMED_EVENT,
        payload: roleEventPayload(role, command.headers),
      });

      return { id: role.getId() };
    });
  }
}

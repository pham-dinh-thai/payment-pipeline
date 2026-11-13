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
import { SetRoleSuperAdminCommand } from './set-role-super-admin.command';
import {
  type IOutboxRepository,
  OUTBOX_REPOSITORY,
} from '../../../../../shared/modules/outbox/domain/outbox.repository';
import { SUPER_ADMIN_SET_EVENT } from '../../../domain/events/super-admin-set.event';
import { auditEventPayload } from '../../../../audit-logs/domain/events/audit-event.payload';
import { EntityType } from '../../../../audit-logs/domain/enums/entity-type.enum';

@CommandHandler(SetRoleSuperAdminCommand)
export class SetRoleSuperAdminHandler implements ICommandHandler<SetRoleSuperAdminCommand> {
  public constructor(
    @Inject(ROLES_REPOSITORY)
    private readonly rolesRepository: IRolesRepository,

    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepository: IOutboxRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(
    command: SetRoleSuperAdminCommand,
  ): Promise<{ id: string }> {
    return this.unitOfWork.run(async () => {
      const role = await this.rolesRepository.findById(command.id);

      if (!role) {
        throw new NotFoundException(`Role id ${command.id} not found`);
      }

      const previousIsSuperAdmin = role.getIsSuperAdmin();

      if (command.isSuperAdmin) {
        role.promoteToSuperAdmin();
      } else {
        role.demoteFromSuperAdmin();
      }

      await this.rolesRepository.update(role);

      await this.outboxRepository.create({
        eventType: SUPER_ADMIN_SET_EVENT,
        payload: auditEventPayload(command.headers, {
          entityType: EntityType.ROLES,
          entityId: role.getId(),
          before: { isSuperAdmin: previousIsSuperAdmin },
          after: { isSuperAdmin: role.getIsSuperAdmin() },
        }),
      });

      return { id: role.getId() };
    });
  }
}

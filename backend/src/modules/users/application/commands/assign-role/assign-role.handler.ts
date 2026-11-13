import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from '../../../domain/users.repository';
import {
  type IRolesRepository,
  ROLES_REPOSITORY,
} from '../../../../authorization/domain/roles.repository';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/modules/unit-of-work/unit-of-work';
import {
  type IOutboxRepository,
  OUTBOX_REPOSITORY,
} from '../../../../../shared/modules/outbox/domain/outbox.repository';
import { AssignRoleCommand } from './assign-role.command';
import { USER_ROLE_ASSIGNED_EVENT } from '../../../domain/events/user-role-assigned.event';
import { auditEventPayload } from '../../../../audit-logs/domain/events/audit-event.payload';
import { EntityType } from '../../../../audit-logs/domain/enums/entity-type.enum';

@CommandHandler(AssignRoleCommand)
export class AssignRoleHandler implements ICommandHandler<AssignRoleCommand> {
  public constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,

    @Inject(ROLES_REPOSITORY)
    private readonly rolesRepository: IRolesRepository,

    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepository: IOutboxRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(
    command: AssignRoleCommand,
  ): Promise<{ id: string; roleIds: string[] }> {
    return this.unitOfWork.run(async () => {
      const role = await this.rolesRepository.findById(command.roleId);

      if (!role) {
        throw new NotFoundException(`Role id ${command.roleId} not found`);
      }

      const user = await this.usersRepository.findById(command.userId);

      if (!user) {
        throw new NotFoundException(`User id ${command.userId} not found`);
      }

      const previousRoleIds = user.getRoleIds();

      user.assignRole(role.getId());

      await this.usersRepository.update(user);

      await this.outboxRepository.create({
        eventType: USER_ROLE_ASSIGNED_EVENT,
        payload: auditEventPayload(command.headers, {
          entityType: EntityType.USERS,
          entityId: user.getId(),
          before: { roleIds: previousRoleIds },
          after: { roleIds: user.getRoleIds() },
          metadata: { roleId: role.getId() },
        }),
      });

      return { id: user.getId(), roleIds: user.getRoleIds() };
    });
  }
}

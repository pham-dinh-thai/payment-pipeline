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
} from '../../../../../shared/application/unit-of-work';
import { AssignRoleCommand } from './assign-role.command';

@CommandHandler(AssignRoleCommand)
export class AssignRoleHandler implements ICommandHandler<AssignRoleCommand> {
  public constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,

    @Inject(ROLES_REPOSITORY)
    private readonly rolesRepository: IRolesRepository,

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

      user.assignRole(role.getId());

      await this.usersRepository.update(user);

      return { id: user.getId(), roleIds: user.getRoleIds() };
    });
  }
}

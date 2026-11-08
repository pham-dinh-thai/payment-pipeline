import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  type IRolesRepository,
  ROLES_REPOSITORY,
} from '../../../domain/roles.repository';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/application/unit-of-work';
import { RevokePermissionCommand } from './revoke-permission.command';

@CommandHandler(RevokePermissionCommand)
export class RevokePermissionHandler implements ICommandHandler<RevokePermissionCommand> {
  public constructor(
    @Inject(ROLES_REPOSITORY)
    private readonly rolesRepository: IRolesRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(
    command: RevokePermissionCommand,
  ): Promise<{ id: string }> {
    return this.unitOfWork.run(async () => {
      const role = await this.rolesRepository.findById(command.id);

      if (!role) {
        throw new NotFoundException(`Role id ${command.id} not found`);
      }

      role.revoke(command.permission);

      await this.rolesRepository.update(role);

      return { id: role.getId() };
    });
  }
}

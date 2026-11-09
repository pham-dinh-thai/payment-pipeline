import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from '../../../domain/users.repository';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/application/unit-of-work';
import { RemoveRoleCommand } from './remove-role.command';

@CommandHandler(RemoveRoleCommand)
export class RemoveRoleHandler implements ICommandHandler<RemoveRoleCommand> {
  public constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(
    command: RemoveRoleCommand,
  ): Promise<{ id: string; roleIds: string[] }> {
    return this.unitOfWork.run(async () => {
      const user = await this.usersRepository.findById(command.userId);

      if (!user) {
        throw new NotFoundException(`User id ${command.userId} not found`);
      }

      user.removeRole(command.roleId);

      await this.usersRepository.update(user);

      return { id: user.getId(), roleIds: user.getRoleIds() };
    });
  }
}

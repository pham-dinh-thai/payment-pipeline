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
} from '../../../../../shared/application/unit-of-work';

@CommandHandler(ChangeUserEmailCommand)
export class ChangeUserEmailHandler implements ICommandHandler<ChangeUserEmailCommand> {
  public constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,

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

      user.changeEmail(command.email);

      await this.usersRepository.update(user);

      return new ChangeUserEmailReadModel(
        user.getId(),
        user.getFirstName(),
        user.getLastName(),
        user.getEmail(),
      );
    });
  }
}

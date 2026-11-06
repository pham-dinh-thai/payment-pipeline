import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from '../../../domain/users.repository';
import { ConflictException, Inject } from '@nestjs/common';
import { User } from '../../../domain/user.aggregate';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/application/unit-of-work';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  public constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(command: CreateUserCommand): Promise<{ id: string }> {
    return this.unitOfWork.run(async () => {
      if (await this.usersRepository.existsByEmail(command.email)) {
        throw new ConflictException(
          `User email ${command.email} already exists`,
        );
      }

      const user = User.create({
        firstName: command.firstName,
        lastName: command.lastName,
        email: command.email,
      });

      await this.usersRepository.create(user);

      return { id: user.getId() };
    });
  }
}

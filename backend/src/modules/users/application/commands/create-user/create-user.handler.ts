import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateUserCommand } from './create-user.command';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/modules/unit-of-work/unit-of-work';
import { CreateUserService } from '../../services/create-user.service';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  public constructor(
    private readonly createUserService: CreateUserService,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(command: CreateUserCommand): Promise<{ id: string }> {
    return this.unitOfWork.run(async () => {
      const user = await this.createUserService.create({
        firstName: command.firstName,
        lastName: command.lastName,
        email: command.email,
      });

      return { id: user.getId() };
    });
  }
}

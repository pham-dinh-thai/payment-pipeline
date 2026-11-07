import { Injectable } from '@nestjs/common';
import {
  CreateUserRequest,
  ICreateUserPort,
} from '../../application/commands/register/ports/create-user.port';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../../users/application/commands/create-user/create-user.command';

@Injectable()
export class CreateUserAdapter implements ICreateUserPort {
  public constructor(private readonly commandBus: CommandBus) {}

  public async execute(request: CreateUserRequest): Promise<{ id: string }> {
    return await this.commandBus.execute(
      new CreateUserCommand(request.firstName, request.lastName, request.email),
    );
  }
}

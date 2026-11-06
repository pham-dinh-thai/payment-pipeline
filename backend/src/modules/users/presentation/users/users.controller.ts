import {
  Body,
  Controller,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserRequest } from './requests/create-user.request';
import { CreateUserCommand } from '../../application/commands/create-user/create-user.command';
import { ChangeUserEmailCommand } from '../../application/commands/change-user-email/change-user-email.command';
import { ChangeUserEmailRequest } from './requests/change-user-email.request';
import { ChangeUserEmailReadModel } from '../../application/commands/change-user-email/change-user-email.read-model';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  public constructor(private readonly commandBus: CommandBus) {}

  @Post()
  public async create(
    @Body() request: CreateUserRequest,
  ): Promise<{ id: string }> {
    const response = await this.commandBus.execute(
      new CreateUserCommand(request.firstName, request.lastName, request.email),
    );

    this.logger.log(`User created`, response);

    return response;
  }

  @Patch(':id/email')
  public async changeEmail(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() request: ChangeUserEmailRequest,
  ): Promise<ChangeUserEmailReadModel> {
    const response = await this.commandBus.execute(
      new ChangeUserEmailCommand(id, request.email),
    );

    this.logger.log(`User ${id} email changed`, response);

    return response;
  }
}

import {
  Body,
  Controller,
  Delete,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserRequest } from './requests/create-user.request';
import { CreateUserByAdminCommand } from '../../application/commands/create-user-by-admin/create-user-by-admin.command';
import { ChangeUserEmailCommand } from '../../application/commands/change-user-email/change-user-email.command';
import { ChangeUserEmailRequest } from './requests/change-user-email.request';
import { ChangeUserEmailReadModel } from '../../application/commands/change-user-email/change-user-email.read-model';
import { AssignRoleCommand } from '../../application/commands/assign-role/assign-role.command';
import { RemoveRoleCommand } from '../../application/commands/remove-role/remove-role.command';
import { AssignRoleRequest } from './requests/assign-role.request';
import { AuthGuard } from '../../../../shared/modules/security/auth.guard';
import { ActorContext } from '../../../../shared/modules/security/actor-context.decorator';
import { type ActorHeaders } from '../../../../shared/types/actor-headers';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  public constructor(private readonly commandBus: CommandBus) {}

  @Post()
  public async create(
    @Body() request: CreateUserRequest,
    @ActorContext() headers: ActorHeaders,
  ): Promise<{ id: string }> {
    const response = await this.commandBus.execute(
      new CreateUserByAdminCommand(
        request.firstName,
        request.lastName,
        request.email,
        headers,
      ),
    );

    this.logger.log(`User created`, response);

    return response;
  }

  @Patch(':id/email')
  public async changeEmail(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() request: ChangeUserEmailRequest,
    @ActorContext() headers: ActorHeaders,
  ): Promise<ChangeUserEmailReadModel> {
    const response = await this.commandBus.execute(
      new ChangeUserEmailCommand(id, request.email, headers),
    );

    this.logger.log(`User ${id} email changed`, response);

    return response;
  }

  @Post(':id/roles')
  public assignRole(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() request: AssignRoleRequest,
    @ActorContext() headers: ActorHeaders,
  ): Promise<{ id: string; roleIds: string[] }> {
    return this.commandBus.execute(
      new AssignRoleCommand(id, request.roleId, headers),
    );
  }

  @Delete(':id/roles/:roleId')
  public removeRole(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('roleId', new ParseUUIDPipe({ version: '4' })) roleId: string,
    @ActorContext() headers: ActorHeaders,
  ): Promise<{ id: string; roleIds: string[] }> {
    return this.commandBus.execute(new RemoveRoleCommand(id, roleId, headers));
  }
}

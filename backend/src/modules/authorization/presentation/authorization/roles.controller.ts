import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateRoleCommand } from '../../application/commands/create-role/create-role.command';
import { RenameRoleCommand } from '../../application/commands/rename-role/rename-role.command';
import { GrantPermissionCommand } from '../../application/commands/grant-permission/grant-permission.command';
import { RevokePermissionCommand } from '../../application/commands/revoke-permission/revoke-permission.command';
import { SetRoleSuperAdminCommand } from '../../application/commands/set-role-super-admin/set-role-super-admin.command';
import { GetRoleQuery } from '../../application/queries/get-role/get-role.query';
import { RoleReadModel } from '../../application/queries/get-role/role.read-model';
import { ListRolesQuery } from '../../application/queries/list-roles/list-roles.query';
import { RoleListItemReadModel } from '../../application/queries/list-roles/role-list-item.read-model';
import { CreateRoleRequest } from './requests/create-role.request';
import { RenameRoleRequest } from './requests/rename-role.request';
import { GrantPermissionRequest } from './requests/grant-permission.request';
import { SetRoleSuperAdminRequest } from './requests/set-role-super-admin.request';
import { PermissionKey } from '../../domain/permission/permission-catalog';
import { AuthGuard } from '../../../../shared/infrastructure/security/auth.guard';

@UseGuards(AuthGuard)
@Controller('roles')
export class RolesController {
  public constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  public findAll(): Promise<RoleListItemReadModel[]> {
    return this.queryBus.execute(new ListRolesQuery());
  }

  @Get(':id')
  public findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<RoleReadModel> {
    return this.queryBus.execute(new GetRoleQuery(id));
  }

  @Post()
  public create(@Body() request: CreateRoleRequest): Promise<{ id: string }> {
    return this.commandBus.execute(
      new CreateRoleCommand(
        request.name,
        (request.permissions ?? []) as PermissionKey[],
        request.isSuperAdmin ?? false,
      ),
    );
  }

  @Patch(':id')
  public rename(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() request: RenameRoleRequest,
  ): Promise<{ id: string }> {
    return this.commandBus.execute(new RenameRoleCommand(id, request.name));
  }

  @Post(':id/permissions')
  public grant(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() request: GrantPermissionRequest,
  ): Promise<{ id: string }> {
    return this.commandBus.execute(
      new GrantPermissionCommand(id, request.permission as PermissionKey),
    );
  }

  @Delete(':id/permissions/:permission')
  public revoke(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('permission') permission: string,
  ): Promise<{ id: string }> {
    return this.commandBus.execute(
      new RevokePermissionCommand(id, permission as PermissionKey),
    );
  }

  @Patch(':id/super-admin')
  public setSuperAdmin(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() request: SetRoleSuperAdminRequest,
  ): Promise<{ id: string }> {
    return this.commandBus.execute(
      new SetRoleSuperAdminCommand(id, request.isSuperAdmin),
    );
  }
}

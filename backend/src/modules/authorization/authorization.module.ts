import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { MikroRole } from './infrastructure/entities/mikro-role.entity';
import { ROLES_REPOSITORY } from './domain/roles.repository';
import { MikroRolesRepository } from './infrastructure/repositories/mikro-roles.repository';
import { RolesController } from './presentation/authorization/roles.controller';
import { CreateRoleHandler } from './application/commands/create-role/create-role.handler';
import { RenameRoleHandler } from './application/commands/rename-role/rename-role.handler';
import { GrantPermissionHandler } from './application/commands/grant-permission/grant-permission.handler';
import { RevokePermissionHandler } from './application/commands/revoke-permission/revoke-permission.handler';
import { SetRoleSuperAdminHandler } from './application/commands/set-role-super-admin/set-role-super-admin.handler';
import { GetRoleHandler } from './application/queries/get-role/get-role.handler';
import { ListRolesHandler } from './application/queries/list-roles/list-roles.handler';
import { SecurityModule } from '../../shared/modules/security/security.module';

@Module({
  imports: [MikroOrmModule.forFeature([MikroRole]), SecurityModule],
  controllers: [RolesController],
  providers: [
    { provide: ROLES_REPOSITORY, useClass: MikroRolesRepository },
    CreateRoleHandler,
    RenameRoleHandler,
    GrantPermissionHandler,
    RevokePermissionHandler,
    SetRoleSuperAdminHandler,
    GetRoleHandler,
    ListRolesHandler,
  ],
  exports: [ROLES_REPOSITORY],
})
export class AuthorizationModule {}

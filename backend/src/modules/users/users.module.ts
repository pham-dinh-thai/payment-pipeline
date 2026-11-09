import { Module } from '@nestjs/common';
import { UsersController } from './presentation/users/users.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { USERS_REPOSITORY } from './domain/users.repository';
import { MikroUsersRepository } from './infrastructure/repositories/mikro-users.repository';
import { CreateUserHandler } from './application/commands/create-user/create-user.handler';
import { MikroUser } from './infrastructure/entities/mikro-user.entity';
import { ChangeUserEmailHandler } from './application/commands/change-user-email/change-user-email.handler';
import { GetUserByEmailHandler } from './application/queries/get-user-by-email/get-user-by-email.handler';
import { GetUserByIdHandler } from './application/queries/get-user-by-id/get-user-by-id.handler';
import { AuthorizationModule } from '../authorization/authorization.module';
import { AssignRoleHandler } from './application/commands/assign-role/assign-role.handler';
import { RemoveRoleHandler } from './application/commands/remove-role/remove-role.handler';

@Module({
  controllers: [UsersController],
  imports: [MikroOrmModule.forFeature([MikroUser]), AuthorizationModule],
  providers: [
    { provide: USERS_REPOSITORY, useClass: MikroUsersRepository },
    CreateUserHandler,
    ChangeUserEmailHandler,
    GetUserByEmailHandler,
    GetUserByIdHandler,
    AssignRoleHandler,
    RemoveRoleHandler,
  ],
})
export class UsersModule {}

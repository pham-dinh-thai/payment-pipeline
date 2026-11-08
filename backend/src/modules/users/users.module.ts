import { Module } from '@nestjs/common';
import { UsersController } from './presentation/users/users.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { USERS_REPOSITORY } from './domain/users.repository';
import { MikroUsersRepository } from './infrastructure/repositories/mikro-users.repository';
import { CreateUserHandler } from './application/commands/create-user/create-user.handler';
import { MikroUnitOfWork } from '../../shared/infrastructure/persistence/mikro-unit-of-work';
import { UNIT_OF_WORK } from '../../shared/application/unit-of-work';
import { MikroUser } from './infrastructure/entities/mikro-user.entity';
import { ChangeUserEmailHandler } from './application/commands/change-user-email/change-user-email.handler';
import { GetUserByEmailHandler } from './application/queries/get-user-by-email/get-user-by-email.handler';
import { GetUserByIdHandler } from './application/queries/get-user-by-id/get-user-by-id.handler';

@Module({
  controllers: [UsersController],
  imports: [MikroOrmModule.forFeature([MikroUser])],
  providers: [
    { provide: USERS_REPOSITORY, useClass: MikroUsersRepository },
    { provide: UNIT_OF_WORK, useClass: MikroUnitOfWork },
    CreateUserHandler,
    ChangeUserEmailHandler,
    GetUserByEmailHandler,
    GetUserByIdHandler,
  ],
})
export class UsersModule {}

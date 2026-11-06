import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { MikroAccount } from './infrastructure/entities/mikro-account.entity';
import { UNIT_OF_WORK } from '../../shared/application/unit-of-work';
import { MikroUnitOfWork } from '../../shared/infrastructure/persistence/mikro-unit-of-work';
import { ACCOUNTS_REPOSITORY } from './domain/accounts.repository';
import { MikroAccountsRepository } from './infrastructure/repositories/mikro-accounts.repository';
import { LoginHandler } from './application/commands/login/login.handler';
import { RegisterHandler } from './application/commands/register/register.handler';
import { AuthenticationController } from './presentation/authentication/authentication.controller';

@Module({
  imports: [MikroOrmModule.forFeature([MikroAccount])],
  providers: [
    { provide: UNIT_OF_WORK, useClass: MikroUnitOfWork },
    { provide: ACCOUNTS_REPOSITORY, useClass: MikroAccountsRepository },
    LoginHandler,
    RegisterHandler,
  ],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}

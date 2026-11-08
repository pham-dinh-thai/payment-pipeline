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
import { CREATE_USER_PORT } from './application/commands/register/ports/create-user.port';
import { CreateUserAdapter } from './infrastructure/adapters/create-user.adapter';
import { CREATE_CUSTOMER_PORT } from './application/commands/register/ports/create-customer.port';
import { CreateCustomerAdapter } from './infrastructure/adapters/create-customer.adapter';
import { GET_USER_BY_EMAIL_PORT } from './application/commands/login/ports/get-user-by-email.port';
import { GetUserByEmailAdapter } from './infrastructure/adapters/get-user-by-email.adapter';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SIGN_TOKEN_PORT } from './application/ports/sign-token.port';
import { JwtSignTokenAdapter } from './infrastructure/adapters/jwt-sign-token.adapter';
import { REFRESH_TOKEN_STORE_PORT } from './application/ports/refresh-token-store.port';
import { RedisRefreshTokenStorePort } from './infrastructure/adapters/redis-refresh-token-store.adapter';
import { REFRESH_TOKEN_VERIFY_PORT } from './application/commands/refresh-token/ports/refresh-token-verify.port';
import { JwtRefreshTokenVerifyAdapter } from './infrastructure/adapters/jwt-refresh-token-verify.adaper';
import { RefreshTokenHandler } from './application/commands/refresh-token/refresh-token.handler';
import { GET_USER_BY_ID_PORT } from './application/commands/refresh-token/ports/get-user-by-id-port';
import { GetUserByIdAdapter } from './infrastructure/adapters/get-user-by-id.adapter';

@Module({
  imports: [
    MikroOrmModule.forFeature([MikroAccount]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        signOptions: { expiresIn: config.getOrThrow('JWT_ACCESS_EXPIRES_IN') },
      }),
    }),
  ],
  providers: [
    { provide: UNIT_OF_WORK, useClass: MikroUnitOfWork },
    { provide: ACCOUNTS_REPOSITORY, useClass: MikroAccountsRepository },
    { provide: CREATE_USER_PORT, useClass: CreateUserAdapter },
    { provide: CREATE_CUSTOMER_PORT, useClass: CreateCustomerAdapter },
    { provide: GET_USER_BY_EMAIL_PORT, useClass: GetUserByEmailAdapter },
    { provide: GET_USER_BY_ID_PORT, useClass: GetUserByIdAdapter },
    { provide: SIGN_TOKEN_PORT, useClass: JwtSignTokenAdapter },
    { provide: REFRESH_TOKEN_STORE_PORT, useClass: RedisRefreshTokenStorePort },
    {
      provide: REFRESH_TOKEN_VERIFY_PORT,
      useClass: JwtRefreshTokenVerifyAdapter,
    },
    LoginHandler,
    RegisterHandler,
    RefreshTokenHandler,
  ],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}

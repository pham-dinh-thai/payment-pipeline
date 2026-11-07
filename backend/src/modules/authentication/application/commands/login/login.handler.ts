import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from './login.command';
import { BadRequestException, Inject } from '@nestjs/common';
import {
  GET_USER_BY_EMAIL_PORT,
  type IGetUserByEmailPort,
} from './ports/get-user-by-email.port';
import {
  ACCOUNTS_REPOSITORY,
  type IAccountsRepository,
} from '../../../domain/accounts.repository';
import { type ISignTokenPort, SIGN_TOKEN_PORT } from './ports/sign-token.port';
import { randomUUID } from 'crypto';
import { Password } from '../../../domain/password.value-object';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  private static readonly DUMMY_HASH = Password.fromHashed(
    '$argon2id$v=19$m=19,t=2,p=1$Y0NOdlVMaUJab1VqYk91Wg$xaGho2hssx4Fouiny58tpA',
  );

  public constructor(
    @Inject(ACCOUNTS_REPOSITORY)
    private readonly accountsRepository: IAccountsRepository,

    @Inject(GET_USER_BY_EMAIL_PORT)
    private readonly getUserByEmailPort: IGetUserByEmailPort,

    @Inject(SIGN_TOKEN_PORT)
    private readonly signTokenPort: ISignTokenPort,
  ) {}

  public async execute(
    command: LoginCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const exists = await this.getUserByEmailPort.execute(command.email);

    if (!exists) {
      await LoginHandler.DUMMY_HASH.verify(command.password); // Doesn't matter if it's true or false; its main purpose is to prevent timing attack / user enumeration

      throw new BadRequestException('Email or password invalid');
    }

    const account = await this.accountsRepository.findByUserIdOrFail(exists.id);

    if (!(await account.verify(command.password))) {
      throw new BadRequestException('Email or password invalid');
    }

    return await this.signTokenPort.sign(
      {
        userId: account.getUserId(),
        email: exists.email,
      },
      {
        sub: account.getUserId(),
        jti: randomUUID(),
      },
    );
  }
}

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
import {
  AccessTokenPayload,
  type ISignTokenPort,
  RefreshTokenPayload,
  SIGN_TOKEN_PORT,
} from '../../ports/sign-token.port';
import { randomUUID } from 'crypto';
import { Password } from '../../../domain/password.value-object';
import {
  type IRefreshTokenStorePort,
  REFRESH_TOKEN_STORE_PORT,
} from '../../ports/refresh-token-store.port';
import {
  type IOutboxRepository,
  OUTBOX_REPOSITORY,
} from '../../../../../shared/modules/outbox/domain/outbox.repository';
import { ACCOUNT_SIGNED_IN_EVENT } from '../../../domain/events/account-signed-in.event';
import { auditEventPayload } from '../../../../audit-logs/domain/events/audit-event.payload';
import { EntityType } from '../../../../audit-logs/domain/enums/entity-type.enum';
import { ActorType } from '../../../../audit-logs/domain/enums/actor-type.enum';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  // Valid UUID that never belongs to a real account. Looking it up lets the
  // "unknown email" branch run the same DB round-trip as a real login.
  private static readonly DUMMY_USER_ID =
    '00000000-0000-0000-0000-000000000000';

  public constructor(
    @Inject(ACCOUNTS_REPOSITORY)
    private readonly accountsRepository: IAccountsRepository,

    @Inject(GET_USER_BY_EMAIL_PORT)
    private readonly getUserByEmailPort: IGetUserByEmailPort,

    @Inject(SIGN_TOKEN_PORT)
    private readonly signTokenPort: ISignTokenPort,

    @Inject(REFRESH_TOKEN_STORE_PORT)
    private readonly refreshTokenStorePort: IRefreshTokenStorePort,

    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepository: IOutboxRepository,
  ) {}

  public async execute(
    command: LoginCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.getUserByEmailPort.execute(command.email);

    // Resolve the account even when the email is unknown, so both branches do
    // the same number of DB round-trips before the Argon2 verification below.
    const account = await this.accountsRepository.findByUserId(
      user?.id ?? LoginHandler.DUMMY_USER_ID,
    );

    if (!user || !account) {
      // Doesn't matter if it's true or false; its main purpose is to prevent timing attack / user enumeration
      await Password.verifyDummy(command.password);

      throw new BadRequestException('Email or password invalid');
    }

    if (!(await account.verify(command.password))) {
      throw new BadRequestException('Email or password invalid');
    }

    const sub = account.getUserId();
    const jti = randomUUID();

    const accessTokenPayload: AccessTokenPayload = {
      sub,
      email: user.email,
    };
    const refreshTokenPayload: RefreshTokenPayload = {
      sub,
      jti,
    };

    const { accessToken, refreshToken } = await this.signTokenPort.sign(
      accessTokenPayload,
      refreshTokenPayload,
    );

    await this.refreshTokenStorePort.save(
      sub,
      jti,
      refreshToken,
      7 * 24 * 60 * 60,
    );

    await this.outboxRepository.create({
      eventType: ACCOUNT_SIGNED_IN_EVENT,
      payload: auditEventPayload(
        {
          actorId: sub,
          actorType: ActorType.USER,
          actorLabel: user.email,
          userIp: command.ip,
          userAgent: command.userAgent,
        },
        {
          entityType: EntityType.ACCOUNTS,
          entityId: account.getId(),
          after: {
            accountId: account.getId(),
            userId: account.getUserId(),
          },
        },
      ),
    });

    return { accessToken, refreshToken };
  }
}

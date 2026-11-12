import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterRequest } from './requests/register.request';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterCommand } from '../../application/commands/register/register.command';
import { LoginRequest } from './requests/login.request';
import { LoginCommand } from '../../application/commands/login/login.command';
import { RefreshTokenCommand } from '../../application/commands/refresh-token/refresh-token.command';
import { type Request, type Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ActorContext } from '../../../../shared/modules/security/actor-context.decorator';
import { type ActorHeaders } from '../../../../shared/types/actor-headers';

const REFRESH_COOKIE = 'refresh_token';
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

@Controller('authentication')
export class AuthenticationController {
  public constructor(
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService,
  ) {}

  private setRefreshCookie(res: Response, token: string): void {
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/api/authentication/refresh',
      maxAge: REFRESH_MAX_AGE_MS,
    });
  }

  @Post('/register')
  public async register(
    @Body() request: RegisterRequest,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<void> {
    return await this.commandBus.execute(
      new RegisterCommand(
        request.firstName,
        request.lastName,
        request.email,
        request.password,
        ip,
        userAgent,
      ),
    );
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() request: LoginRequest,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken } = await this.commandBus.execute(
      new LoginCommand(request.email, request.password, ip, userAgent),
    );

    this.setRefreshCookie(res, refreshToken);

    return { accessToken };
  }

  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  public async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const token: unknown = req.cookies?.[REFRESH_COOKIE];
    if (typeof token !== 'string' || !token) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const { accessToken, refreshToken } = await this.commandBus.execute(
      new RefreshTokenCommand(token),
    );
    this.setRefreshCookie(res, refreshToken);
    return { accessToken };
  }
}

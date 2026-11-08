import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IRefreshTokenVerifyPort } from '../../application/commands/refresh-token/ports/refresh-token-verify.port';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshTokenVerifyAdapter implements IRefreshTokenVerifyPort {
  public constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async verify(
    refreshToken: string,
  ): Promise<{ sub: string; jti: string }> {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub?: string;
        jti?: string;
      }>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        algorithms: ['HS256'],
      });

      if (!payload.sub || !payload.jti) {
        throw new Error('Malformed refresh token payload');
      }

      return { sub: payload.sub, jti: payload.jti };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}

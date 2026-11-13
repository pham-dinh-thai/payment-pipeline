export type AccessTokenPayload = {
  sub: string;
  email: string;
};

export type RefreshTokenPayload = {
  sub: string;
  jti: string;
};

export interface ISignTokenPort {
  sign(
    accessTokenPayload: AccessTokenPayload,
    refreshTokenPayload: RefreshTokenPayload,
  ): Promise<{ accessToken: string; refreshToken: string }>;
}

export const SIGN_TOKEN_PORT = 'ISignTokenPort';

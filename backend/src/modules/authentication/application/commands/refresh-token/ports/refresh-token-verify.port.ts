export interface IRefreshTokenVerifyPort {
  verify(refreshToken: string): Promise<{ sub: string; jti: string }>;
}

export const REFRESH_TOKEN_VERIFY_PORT = 'IRefreshTokenVerifyPort';

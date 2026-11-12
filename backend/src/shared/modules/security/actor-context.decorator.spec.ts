import { describe, expect, it } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { type AuthUser } from './current-user.decorator';
import { actorHeadersFromRequest } from './actor-context.decorator';

const request = (
  overrides: Partial<Request & { user?: AuthUser }> = {},
): Request & { user?: AuthUser } =>
  ({
    user: { sub: 'user-1', email: 'admin@example.com' },
    ip: '127.0.0.1',
    headers: { 'user-agent': 'jest' },
    ...overrides,
  }) as unknown as Request & { user?: AuthUser };

describe('actorHeadersFromRequest', () => {
  it('builds actor headers from the request', () => {
    expect(actorHeadersFromRequest(request())).toEqual({
      actorId: 'user-1',
      actorType: 'user',
      actorLabel: 'admin@example.com',
      userIp: '127.0.0.1',
      userAgent: 'jest',
    });
  });

  it('falls back to empty strings when optional values are missing', () => {
    expect(
      actorHeadersFromRequest(request({ ip: undefined, headers: {} })),
    ).toEqual({
      actorId: 'user-1',
      actorType: 'user',
      actorLabel: 'admin@example.com',
      userIp: '',
      userAgent: '',
    });
  });

  it('throws when the request has no authenticated user', () => {
    expect(() => actorHeadersFromRequest(request({ user: undefined }))).toThrow(
      UnauthorizedException,
    );
  });
});

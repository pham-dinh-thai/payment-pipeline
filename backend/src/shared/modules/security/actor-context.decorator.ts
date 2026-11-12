import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { type ActorHeaders } from '../../types/actor-headers';
import { type AuthUser } from './current-user.decorator';

type RequestWithUser = Request & { user?: AuthUser };

export const actorHeadersFromRequest = (
  request: RequestWithUser,
): ActorHeaders => {
  const user = request.user;

  if (!user) {
    throw new UnauthorizedException('Missing authenticated user');
  }

  return {
    actorId: user.sub,
    actorType: 'user',
    actorLabel: user.email,
    userIp: request.ip ?? '',
    userAgent: request.headers['user-agent'] ?? '',
  };
};

export const ActorContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ActorHeaders =>
    actorHeadersFromRequest(ctx.switchToHttp().getRequest<RequestWithUser>()),
);

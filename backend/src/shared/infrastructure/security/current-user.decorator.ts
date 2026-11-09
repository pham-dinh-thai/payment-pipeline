import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export type AuthUser = {
  sub: string;
  email: string;
};

export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request & { user?: AuthUser }>();

    const user = request.user;

    return data ? user?.[data] : user;
  },
);

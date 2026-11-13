import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Reflector } from '@nestjs/core';
import { type AccessTokenPayload } from '../../../modules/authentication/application/ports/sign-token.port';
import { GetActorPermissionsQuery } from '../../../modules/authorization/application/queries/get-actor-permissions/get-actor-permissions.query';
import {
  parsePermissionKey,
  permissionMatches,
  type PermissionKey,
} from '../../../modules/authorization/domain/permission/permission-catalog';
import { REQUIRE_PERMISSIONS } from './require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  public constructor(
    private readonly queryBus: QueryBus,
    private readonly reflector: Reflector,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<PermissionKey[]>(
      REQUIRE_PERMISSIONS,
      [context.getHandler(), context.getClass()],
    );

    if (!required?.length) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AccessTokenPayload }>();

    const sub = request.user?.sub;
    if (!sub) {
      throw new UnauthorizedException('Missing access token');
    }

    const { isSuperAdmin, permissions } = await this.getActorPermissions(sub);

    if (isSuperAdmin || this.hasAnyPermission(permissions, required)) {
      return true;
    }

    throw new ForbiddenException('Insufficient permissions');
  }

  private async getActorPermissions(sub: string): Promise<{
    isSuperAdmin: boolean;
    permissions: PermissionKey[];
  }> {
    try {
      return await this.queryBus.execute(new GetActorPermissionsQuery(sub));
    } catch (error) {
      if (error instanceof NotFoundException) {
        // A valid token for a user that no longer exists must not leak as 404.
        throw new UnauthorizedException('Authenticated user no longer exists');
      }

      throw error;
    }
  }

  private hasAnyPermission(
    granted: PermissionKey[],
    required: PermissionKey[],
  ): boolean {
    return required.some((requiredKey) => {
      const parsed = parsePermissionKey(requiredKey);

      if (!parsed) {
        return false;
      }

      return granted.some((grantedKey) =>
        permissionMatches(grantedKey, parsed.resource, parsed.action),
      );
    });
  }
}

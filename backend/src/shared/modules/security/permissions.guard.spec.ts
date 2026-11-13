import { describe, expect, it, jest } from '@jest/globals';
import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Reflector } from '@nestjs/core';
import { GetActorPermissionsQuery } from '../../../modules/authorization/application/queries/get-actor-permissions/get-actor-permissions.query';
import { GetActorPermissionsReadModel } from '../../../modules/authorization/application/queries/get-actor-permissions/get-actor-permissions.read-model';
import { type PermissionKey } from '../../../modules/authorization/domain/permission/permission-catalog';
import { PermissionsGuard } from './permissions.guard';

const contextWith = (sub?: string): ExecutionContext =>
  ({
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => ({ user: sub ? { sub } : undefined }),
    }),
  }) as unknown as ExecutionContext;

const permissionsOf = (
  permissions: PermissionKey[],
  isSuperAdmin = false,
): GetActorPermissionsReadModel =>
  new GetActorPermissionsReadModel('actor-1', permissions, isSuperAdmin);

type GetAllAndOverride = (
  key: string | symbol,
  targets: unknown[],
) => PermissionKey[] | undefined;

type Execute = (
  query: GetActorPermissionsQuery,
) => Promise<GetActorPermissionsReadModel>;

const setup = (required?: PermissionKey[]) => {
  const getAllAndOverride = jest.fn<GetAllAndOverride>();

  getAllAndOverride.mockReturnValue(required);

  const execute = jest.fn<Execute>();

  const guard = new PermissionsGuard(
    { execute } as unknown as QueryBus,
    { getAllAndOverride } as unknown as Reflector,
  );

  return { guard, execute };
};

describe('PermissionsGuard', () => {
  it('allows handlers without permission metadata', async () => {
    const { guard, execute } = setup();

    await expect(guard.canActivate(contextWith('actor-1'))).resolves.toBe(true);
    expect(execute).not.toHaveBeenCalled();
  });

  it('rejects a request without an authenticated actor', async () => {
    const { guard } = setup(['roles:read']);

    await expect(guard.canActivate(contextWith())).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('allows a super admin without checking permissions', async () => {
    const { guard, execute } = setup(['roles:read']);

    execute.mockResolvedValue(permissionsOf([], true));

    await expect(guard.canActivate(contextWith('actor-1'))).resolves.toBe(true);
  });

  it('allows an actor holding the required permission', async () => {
    const { guard, execute } = setup(['roles:read']);

    execute.mockResolvedValue(permissionsOf(['roles:read']));

    await expect(guard.canActivate(contextWith('actor-1'))).resolves.toBe(true);
  });

  it('treats resource:manage as a wildcard for every action', async () => {
    const { guard, execute } = setup(['roles:read']);

    execute.mockResolvedValue(permissionsOf(['roles:manage']));

    await expect(guard.canActivate(contextWith('actor-1'))).resolves.toBe(true);
  });

  it('does not let a concrete action satisfy a manage requirement', async () => {
    const { guard, execute } = setup(['roles:manage']);

    execute.mockResolvedValue(permissionsOf(['roles:read']));

    await expect(
      guard.canActivate(contextWith('actor-1')),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows the actor when any listed permission is granted', async () => {
    const { guard, execute } = setup(['products:create', 'products:update']);

    execute.mockResolvedValue(permissionsOf(['products:update']));

    await expect(guard.canActivate(contextWith('actor-1'))).resolves.toBe(true);
  });

  it('does not grant a permission from another resource', async () => {
    const { guard, execute } = setup(['products:read']);

    execute.mockResolvedValue(permissionsOf(['suppliers:manage']));

    await expect(
      guard.canActivate(contextWith('actor-1')),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('turns a missing actor into 401 instead of 404', async () => {
    const { guard, execute } = setup(['roles:read']);

    execute.mockRejectedValue(new NotFoundException('User not found'));

    await expect(
      guard.canActivate(contextWith('actor-1')),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

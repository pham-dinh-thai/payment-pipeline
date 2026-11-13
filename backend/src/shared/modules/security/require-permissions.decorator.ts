import { SetMetadata } from '@nestjs/common';
import { type PermissionKey } from '../../../modules/authorization/domain/permission/permission-catalog';

export const REQUIRE_PERMISSIONS = 'RequirePermissions';

/**
 * Requires the actor to hold at least one of the given permissions.
 *
 * A wildcard grant such as `roles:manage` satisfies every action on the same
 * resource, so endpoints only need to declare the concrete action.
 */
export const RequirePermissions = (permissions: PermissionKey[]) =>
  SetMetadata(REQUIRE_PERMISSIONS, permissions);

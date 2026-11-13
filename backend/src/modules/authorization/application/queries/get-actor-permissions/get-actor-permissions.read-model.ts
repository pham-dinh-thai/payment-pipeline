import { PermissionKey } from '../../../domain/permission/permission-catalog';

export class GetActorPermissionsReadModel {
  public constructor(
    public readonly actorId: string,
    public readonly permissions: PermissionKey[],
    public readonly isSuperAdmin: boolean,
  ) {}
}

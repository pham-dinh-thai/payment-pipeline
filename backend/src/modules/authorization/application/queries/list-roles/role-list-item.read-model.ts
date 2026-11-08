import { Role } from '../../../domain/role.aggregate';

export class RoleListItemReadModel {
  public constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly permissions: string[],
    public readonly isSuperAdmin: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  public static fromRole(role: Role): RoleListItemReadModel {
    return new RoleListItemReadModel(
      role.getId(),
      role.getName(),
      role.getPermissions(),
      role.getIsSuperAdmin(),
      role.getCreatedAt(),
      role.getUpdatedAt(),
    );
  }
}

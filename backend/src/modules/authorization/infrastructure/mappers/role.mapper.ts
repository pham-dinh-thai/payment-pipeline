import { Role } from '../../domain/role.aggregate';
import { type PermissionKey } from '../../domain/permission/permission-catalog';
import { MikroRole } from '../entities/mikro-role.entity';

export class RoleMapper {
  public static toDomain(mikroRole: MikroRole): Role {
    return Role.fromPersistent({
      id: mikroRole.id,
      name: mikroRole.name,
      permissions: mikroRole.permissions as PermissionKey[],
      isSuperAdmin: mikroRole.isSuperAdmin,
      createdAt: mikroRole.createdAt,
      updatedAt: mikroRole.updatedAt,
    });
  }

  public static toMikroOrm(role: Role): MikroRole {
    const mikroRole = new MikroRole();

    mikroRole.id = role.getId();
    mikroRole.name = role.getName();
    mikroRole.permissions = role.getPermissions();
    mikroRole.isSuperAdmin = role.getIsSuperAdmin();
    mikroRole.createdAt = role.getCreatedAt();
    mikroRole.updatedAt = role.getUpdatedAt();

    return mikroRole;
  }
}

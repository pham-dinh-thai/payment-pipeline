import {
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Id } from '../../../shared/value-objects/id.value-object';
import {
  isPermissionKey,
  PermissionKey,
  permissionMatches,
  Resource,
} from './permission/permission-catalog';

const MAX_NAME_LENGTH = 50;

export type CreateRoleProps = {
  name: string;
  permissions?: PermissionKey[];
  isSuperAdmin?: boolean;
};

export type FromPersistentRoleProps = {
  id: string;
  name: string;
  permissions: PermissionKey[];
  isSuperAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class Role {
  private constructor(
    private readonly id: Id,
    private name: string,
    private readonly permissions: Set<PermissionKey>,
    private isSuperAdmin: boolean,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  public static create(props: CreateRoleProps): Role {
    const now = new Date();
    const permissions = props.permissions ?? [];

    Role.assertValidPermissions(permissions);
    Role.assertNoDuplicatePermissions(permissions);

    return new Role(
      Id.generate(),
      Role.normalizeName(props.name),
      new Set(permissions),
      props.isSuperAdmin ?? false,
      now,
      now,
    );
  }

  public static fromPersistent(props: FromPersistentRoleProps): Role {
    return new Role(
      Id.create(props.id),
      props.name,
      new Set(props.permissions),
      props.isSuperAdmin,
      props.createdAt,
      props.updatedAt,
    );
  }

  public rename(name: string): void {
    this.name = Role.normalizeName(name);
    this.touch();
  }

  public grant(permission: PermissionKey): void {
    Role.assertValidPermission(permission);

    if (this.permissions.has(permission)) {
      throw new ConflictException(
        `Role already has permission "${permission}"`,
      );
    }

    this.permissions.add(permission);
    this.touch();
  }

  public revoke(permission: PermissionKey): void {
    Role.assertValidPermission(permission);

    if (!this.permissions.has(permission)) {
      throw new ConflictException(
        `Role does not have permission "${permission}"`,
      );
    }

    this.permissions.delete(permission);
    this.touch();
  }

  public hasPermission(resource: Resource, action: string): boolean {
    if (this.isSuperAdmin) {
      return true;
    }

    for (const permission of this.permissions) {
      if (permissionMatches(permission, resource, action)) {
        return true;
      }
    }

    return false;
  }

  public promoteToSuperAdmin(): void {
    this.isSuperAdmin = true;
    this.touch();
  }

  public demoteFromSuperAdmin(): void {
    this.isSuperAdmin = false;
    this.touch();
  }

  public getId(): string {
    return this.id.getValue();
  }

  public getName(): string {
    return this.name;
  }

  public getPermissions(): PermissionKey[] {
    return [...this.permissions];
  }

  public getIsSuperAdmin(): boolean {
    return this.isSuperAdmin;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  private touch(): void {
    this.updatedAt = new Date();
  }

  private static normalizeName(raw: string): string {
    const name = raw?.trim();

    if (!name) {
      throw new UnprocessableEntityException('Role name is required');
    }

    if (name.length > MAX_NAME_LENGTH) {
      throw new UnprocessableEntityException(
        `Role name must have at most ${MAX_NAME_LENGTH} characters`,
      );
    }

    return name;
  }

  private static assertValidPermissions(permissions: PermissionKey[]): void {
    permissions.forEach((permission) => Role.assertValidPermission(permission));
  }

  private static assertValidPermission(
    permission: string,
  ): asserts permission is PermissionKey {
    if (!isPermissionKey(permission)) {
      throw new UnprocessableEntityException(
        `Invalid permission "${permission}"`,
      );
    }
  }

  private static assertNoDuplicatePermissions(
    permissions: PermissionKey[],
  ): void {
    if (new Set(permissions).size !== permissions.length) {
      throw new UnprocessableEntityException(
        'Duplicate permissions are not allowed',
      );
    }
  }
}

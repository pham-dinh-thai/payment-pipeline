import {
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Id } from '../../../shared/domain/value-objects/id.value-object';
import { Permission } from './permission/permission.entity';
import { Resource } from './permission/permission-catalog';

const MAX_NAME_LENGTH = 50;

export type CreateRoleProps = {
  name: string;
  permissions?: Permission[];
  isSuperAdmin?: boolean;
};

export type FromPersistentRoleProps = {
  id: string;
  name: string;
  permissions: Permission[];
  isSuperAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class Role {
  private constructor(
    private readonly id: Id,
    private name: string,
    private readonly permissions: Permission[],
    private isSuperAdmin: boolean,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  public static create(props: CreateRoleProps): Role {
    const now = new Date();
    const permissions = [...(props.permissions ?? [])];

    Role.assertNoDuplicatePermissions(permissions);

    return new Role(
      Id.generate(),
      Role.normalizeName(props.name),
      permissions,
      props.isSuperAdmin ?? false,
      now,
      now,
    );
  }

  public static fromPersistent(props: FromPersistentRoleProps): Role {
    return new Role(
      Id.create(props.id),
      props.name,
      [...props.permissions],
      props.isSuperAdmin,
      props.createdAt,
      props.updatedAt,
    );
  }

  public rename(name: string): void {
    this.name = Role.normalizeName(name);
    this.touch();
  }

  public grant(permission: Permission): void {
    const alreadyGranted = this.permissions.some(
      (granted) => granted.getKey() === permission.getKey(),
    );

    if (alreadyGranted) {
      throw new ConflictException(
        `Role already has permission "${permission.getKey()}"`,
      );
    }

    this.permissions.push(permission);
    this.touch();
  }

  public revoke(permission: Permission): void {
    const index = this.permissions.findIndex(
      (granted) => granted.getKey() === permission.getKey(),
    );

    if (index === -1) {
      throw new ConflictException(
        `Role does not have permission "${permission.getKey()}"`,
      );
    }

    this.permissions.splice(index, 1);
    this.touch();
  }

  public hasPermission(resource: Resource, action: string): boolean {
    if (this.isSuperAdmin) {
      return true;
    }

    return this.permissions.some((permission) =>
      permission.matches(resource, action),
    );
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

  public getPermissions(): Permission[] {
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

  private static assertNoDuplicatePermissions(permissions: Permission[]): void {
    const keys = new Set(permissions.map((permission) => permission.getKey()));

    if (keys.size !== permissions.length) {
      throw new UnprocessableEntityException(
        'Duplicate permissions are not allowed',
      );
    }
  }
}

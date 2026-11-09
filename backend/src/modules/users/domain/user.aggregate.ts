import { UnprocessableEntityException } from '@nestjs/common';
import { Id } from '../../../shared/value-objects/id.value-object';

export type CreateUserProps = {
  firstName: string;
  lastName: string;
  email: string;
  roleIds?: string[];
};

export type FromPersistentUserProps = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleIds: string[];
  createdAt: Date;
  updatedAt: Date;
};

export class User {
  public constructor(
    private readonly id: Id,
    private firstName: string,
    private lastName: string,
    private email: string,
    private roleIds: string[],
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  public static create(props: CreateUserProps): User {
    const now = new Date();
    return new User(
      Id.generate(),
      props.firstName,
      props.lastName,
      props.email,
      User.normalizeRoleIds(props.roleIds ?? []),
      now,
      now,
    );
  }

  public static fromPersistent(props: FromPersistentUserProps): User {
    return new User(
      Id.create(props.id),
      props.firstName,
      props.lastName,
      props.email,
      User.normalizeRoleIds(props.roleIds ?? []),
      props.createdAt,
      props.updatedAt,
    );
  }

  public changeEmail(email: string): void {
    this.email = email;

    this.updatedAt = new Date();
  }

  public assignRole(roleId: string): void {
    const normalized = User.normalizeRoleId(roleId);

    if (this.roleIds.includes(normalized)) {
      return;
    }

    this.roleIds = [...this.roleIds, normalized];
    this.updatedAt = new Date();
  }

  public removeRole(roleId: string): void {
    const normalized = User.normalizeRoleId(roleId);

    if (!this.roleIds.includes(normalized)) {
      return;
    }

    this.roleIds = this.roleIds.filter((id) => id !== normalized);
    this.updatedAt = new Date();
  }

  public hasRole(roleId: string): boolean {
    return this.roleIds.includes(roleId);
  }

  public getId(): string {
    return this.id.getValue();
  }

  public getFirstName(): string {
    return this.firstName;
  }

  public getLastName(): string {
    return this.lastName;
  }

  public getEmail(): string {
    return this.email;
  }

  public getRoleIds(): string[] {
    return [...this.roleIds];
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  private static normalizeRoleIds(roleIds: string[]): string[] {
    const normalized = roleIds.map((roleId) => User.normalizeRoleId(roleId));

    return [...new Set(normalized)];
  }

  private static normalizeRoleId(roleId: string): string {
    const trimmed = roleId?.trim();

    if (!trimmed) {
      throw new UnprocessableEntityException('Role id is required');
    }

    return trimmed;
  }
}

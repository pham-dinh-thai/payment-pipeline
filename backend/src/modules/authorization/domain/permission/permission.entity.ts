import { UnprocessableEntityException } from '@nestjs/common';
import { Id } from '../../../../shared/domain/value-objects/id.value-object';
import {
  ActionOf,
  isActionAllowed,
  isResource,
  MANAGE_ACTION,
  Resource,
} from './permission-catalog';

export type CreatePermissionProps = {
  resource: Resource;
  action: ActionOf<Resource> | typeof MANAGE_ACTION;
};

export type FromPersistentPermissionProps = {
  id: string;
  resource: Resource;
  action: string;
  createdAt: Date;
};

export class Permission {
  private constructor(
    private readonly id: Id,
    private readonly resource: Resource,
    private readonly action: string,
    private readonly createdAt: Date,
  ) {}

  public static create(props: CreatePermissionProps): Permission {
    const resource = Permission.normalizeResource(props.resource);
    const action = Permission.normalizeAction(resource, props.action);

    return new Permission(Id.generate(), resource, action, new Date());
  }

  public static fromPersistent(
    props: FromPersistentPermissionProps,
  ): Permission {
    return new Permission(
      Id.create(props.id),
      props.resource,
      props.action,
      props.createdAt,
    );
  }

  public matches(resource: Resource, action: string): boolean {
    if (this.resource !== resource) {
      return false;
    }

    return this.action === MANAGE_ACTION || this.action === action;
  }

  public isWildcard(): boolean {
    return this.action === MANAGE_ACTION;
  }

  public getKey(): string {
    return `${this.resource}:${this.action}`;
  }

  public getId(): string {
    return this.id.getValue();
  }

  public getResource(): Resource {
    return this.resource;
  }

  public getAction(): string {
    return this.action;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  private static normalizeResource(raw: string): Resource {
    if (!isResource(raw)) {
      throw new UnprocessableEntityException(`Unknown resource "${raw}"`);
    }

    return raw;
  }

  private static normalizeAction(resource: Resource, raw: string): string {
    const action = raw?.trim();

    if (action === MANAGE_ACTION) {
      return action;
    }

    if (!action || !isActionAllowed(resource, action)) {
      throw new UnprocessableEntityException(
        `Invalid action "${raw}" for resource "${resource}"`,
      );
    }

    return action;
  }
}

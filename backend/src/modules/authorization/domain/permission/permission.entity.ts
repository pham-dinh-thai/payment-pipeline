import { Action } from './enums/action.enum';
import { Resource } from './enums/resource.enum';

export class Permission {
  private constructor(
    private readonly id: string,
    private readonly resource: Resource,
    private readonly action: Action,
    private readonly createdAt: Date,
  ) {}

  public getId(): string {
    return this.id;
  }

  public getResource(): Resource {
    return this.resource;
  }

  public getAction(): Action {
    return this.action;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }
}

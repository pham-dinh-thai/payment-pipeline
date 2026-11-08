import { Permission } from './permission/permission.entity';

export class Role {
  private constructor(
    private readonly id: string,
    private name: string,
    private permissions: Permission[],
  ) {}

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getPermissions(): Permission[] {
    return [...this.permissions];
  }
}

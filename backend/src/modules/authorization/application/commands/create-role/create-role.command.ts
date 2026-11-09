import { Command } from '@nestjs/cqrs';
import { PermissionKey } from '../../../domain/permission/permission-catalog';

export class CreateRoleCommand extends Command<{ id: string }> {
  public constructor(
    public readonly name: string,
    public readonly permissions: PermissionKey[],
    public readonly isSuperAdmin: boolean,
  ) {
    super();
  }
}

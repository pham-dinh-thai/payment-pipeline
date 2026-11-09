import { Command } from '@nestjs/cqrs';
import { type PermissionKey } from '../../../domain/permission-catalog';

export class CreateRoleCommand extends Command<{ id: string }> {
  public constructor(
    public readonly name: string,
    public readonly permissions: PermissionKey[],
    public readonly isSuperAdmin: boolean,
  ) {
    super();
  }
}

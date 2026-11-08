import { Command } from '@nestjs/cqrs';
import { type PermissionKey } from '../../../domain/permission-catalog';

export class GrantPermissionCommand extends Command<{ id: string }> {
  public constructor(
    public readonly id: string,
    public readonly permission: PermissionKey,
  ) {
    super();
  }
}

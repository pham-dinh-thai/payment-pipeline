import { Command } from '@nestjs/cqrs';
import { PermissionKey } from '../../../domain/permission/permission-catalog';
import { type ActorHeaders } from '../../../../../shared/types/actor-headers';

export class CreateRoleCommand extends Command<{ id: string }> {
  public constructor(
    public readonly name: string,
    public readonly permissions: PermissionKey[],
    public readonly isSuperAdmin: boolean,
    public readonly headers: ActorHeaders,
  ) {
    super();
  }
}

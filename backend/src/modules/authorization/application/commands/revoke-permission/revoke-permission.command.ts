import { Command } from '@nestjs/cqrs';
import { PermissionKey } from '../../../domain/permission/permission-catalog';
import { ActorHeaders } from '../../../../../shared/types/actor-headers';

export class RevokePermissionCommand extends Command<{ id: string }> {
  public constructor(
    public readonly id: string,
    public readonly permission: PermissionKey,
    public readonly headers: ActorHeaders,
  ) {
    super();
  }
}

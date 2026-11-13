import { Command } from '@nestjs/cqrs';
import { type ActorHeaders } from '../../../../../shared/types/actor-headers';

export class RemoveRoleCommand extends Command<{
  id: string;
  roleIds: string[];
}> {
  public constructor(
    public readonly userId: string,
    public readonly roleId: string,
    public readonly headers: ActorHeaders,
  ) {
    super();
  }
}

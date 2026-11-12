import { Command } from '@nestjs/cqrs';
import { ActorHeaders } from '../../../../../shared/types/actor-headers';

export class SetRoleSuperAdminCommand extends Command<{ id: string }> {
  public constructor(
    public readonly id: string,
    public readonly isSuperAdmin: boolean,
    public readonly headers: ActorHeaders,
  ) {
    super();
  }
}

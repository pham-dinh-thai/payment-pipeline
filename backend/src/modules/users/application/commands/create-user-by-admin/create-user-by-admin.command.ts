import { Command } from '@nestjs/cqrs';
import { type ActorHeaders } from '../../../../../shared/types/actor-headers';

export class CreateUserByAdminCommand extends Command<{ id: string }> {
  public constructor(
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly headers: ActorHeaders,
  ) {
    super();
  }
}

import { Command } from '@nestjs/cqrs';
import { type ActorHeaders } from '../../../../../shared/types/actor-headers';
import { ChangeUserEmailReadModel } from './change-user-email.read-model';

export class ChangeUserEmailCommand extends Command<ChangeUserEmailReadModel> {
  public constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly headers: ActorHeaders,
  ) {
    super();
  }
}

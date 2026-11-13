import { Command } from '@nestjs/cqrs';
import { type ActorHeaders } from '../../../../../shared/types/actor-headers';

export class CreateSupplierCommand extends Command<{ id: string }> {
  public constructor(
    public readonly name: string,
    public readonly phone: string | null,
    public readonly email: string | null,
    public readonly address: string | null,
    public readonly taxCode: string | null,
    public readonly headers: ActorHeaders,
  ) {
    super();
  }
}

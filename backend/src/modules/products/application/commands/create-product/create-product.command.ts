import { Command } from '@nestjs/cqrs';
import { type ActorHeaders } from '../../../../../shared/types/actor-headers';

export class CreateProductCommand extends Command<{ id: string }> {
  public constructor(
    public readonly name: string,
    public readonly unitPrice: string,
    public readonly quantity: number,
    public readonly headers: ActorHeaders,
  ) {
    super();
  }
}

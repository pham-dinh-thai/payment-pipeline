import { Command } from '@nestjs/cqrs';
import { type ActorHeaders } from '../../../../../shared/types/actor-headers';

export class IssueBatchStockCommand extends Command<number> {
  public constructor(
    public readonly productId: string,
    public readonly batchId: string,
    public readonly quantity: number,
    public readonly headers: ActorHeaders,
  ) {
    super();
  }
}

import { Command } from '@nestjs/cqrs';
import { type ActorHeaders } from '../../../../../shared/types/actor-headers';

export class CancelGoodsReceiptCommand extends Command<{ id: string }> {
  public constructor(
    public readonly id: string,
    public readonly cancelledBy: string,
    public readonly headers: ActorHeaders,
  ) {
    super();
  }
}

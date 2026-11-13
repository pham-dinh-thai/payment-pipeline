import { Command } from '@nestjs/cqrs';
import { type ActorHeaders } from '../../../../../shared/types/actor-headers';

export class ConfirmGoodsReceiptCommand extends Command<{ id: string }> {
  public constructor(
    public readonly id: string,
    public readonly confirmedBy: string,
    public readonly headers: ActorHeaders,
  ) {
    super();
  }
}

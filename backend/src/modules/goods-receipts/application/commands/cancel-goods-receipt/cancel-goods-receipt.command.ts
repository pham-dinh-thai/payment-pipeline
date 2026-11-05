import { Command } from '@nestjs/cqrs';

export class CancelGoodsReceiptCommand extends Command<{ id: string }> {
  public constructor(
    public readonly id: string,
    public readonly cancelledBy: string,
  ) {
    super();
  }
}

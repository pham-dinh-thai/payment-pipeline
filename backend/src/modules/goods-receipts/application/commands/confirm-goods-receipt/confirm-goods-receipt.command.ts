import { Command } from '@nestjs/cqrs';

export class ConfirmGoodsReceiptCommand extends Command<{ id: string }> {
  public constructor(
    public readonly id: string,
    public readonly confirmedBy: string,
  ) {
    super();
  }
}

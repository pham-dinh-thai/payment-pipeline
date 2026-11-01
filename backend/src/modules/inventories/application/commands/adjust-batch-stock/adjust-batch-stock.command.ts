import { Command } from '@nestjs/cqrs';

export class AdjustBatchStockCommand extends Command<void> {
  public constructor(
    public readonly productId: string,
    public readonly batchId: string,
    public readonly delta: number,
  ) {
    super();
  }
}

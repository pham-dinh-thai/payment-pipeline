import { Command } from '@nestjs/cqrs';

export class ReconcileBatchStockCommand extends Command<number> {
  public constructor(
    public readonly productId: string,
    public readonly batchId: string,
    public readonly countedQuantity: number,
  ) {
    super();
  }
}

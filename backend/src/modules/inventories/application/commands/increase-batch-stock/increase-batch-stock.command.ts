import { Command } from '@nestjs/cqrs';

export class IncreaseBatchStockCommand extends Command<void> {
  public constructor(
    public readonly productId: string,
    public readonly batchId: string,
    public readonly quantity: number,
  ) {
    super();
  }
}

import { Command } from '@nestjs/cqrs';

export class DecreaseBatchStockCommand extends Command<number> {
  public constructor(
    public readonly productId: string,
    public readonly batchId: string,
    public readonly quantity: number,
  ) {
    super();
  }
}

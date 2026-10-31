import { Command } from '@nestjs/cqrs';

export class AddBatchCommand extends Command<{ batchId: string }> {
  public constructor(
    public readonly lotNumber: string,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly unitCost: string,
    public readonly expiresAt: Date,
    public readonly createdBy: string,
  ) {
    super();
  }
}

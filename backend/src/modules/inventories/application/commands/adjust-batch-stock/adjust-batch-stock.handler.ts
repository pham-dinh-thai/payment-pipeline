import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AdjustBatchStockCommand } from './adjust-batch-stock.command';
import { Inject } from '@nestjs/common';
import {
  type IInventoriesRepository,
  INVENTORIES_REPOSITORY,
} from '../../../domain/inventories.repository';

@CommandHandler(AdjustBatchStockCommand)
export class AdjustBatchStockHandler implements ICommandHandler<AdjustBatchStockCommand> {
  public constructor(
    @Inject(INVENTORIES_REPOSITORY)
    private readonly inventoriesRepository: IInventoriesRepository,
  ) {}

  public async execute(command: AdjustBatchStockCommand): Promise<number> {
    return this.inventoriesRepository.adjustBatchStock(
      command.productId,
      command.batchId,
      command.delta,
    );
  }
}

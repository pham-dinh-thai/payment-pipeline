import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IncreaseBatchStockCommand } from './increase-batch-stock.command';
import { Inject } from '@nestjs/common';
import {
  type IInventoriesRepository,
  INVENTORIES_REPOSITORY,
} from '../../../domain/inventories.repository';

@CommandHandler(IncreaseBatchStockCommand)
export class IncreaseBatchStockHandler implements ICommandHandler<IncreaseBatchStockCommand> {
  public constructor(
    @Inject(INVENTORIES_REPOSITORY)
    private readonly inventoriesRepository: IInventoriesRepository,
  ) {}

  public async execute(command: IncreaseBatchStockCommand): Promise<number> {
    return this.inventoriesRepository.adjustBatchStock(
      command.productId,
      command.batchId,
      command.quantity,
    );
  }
}

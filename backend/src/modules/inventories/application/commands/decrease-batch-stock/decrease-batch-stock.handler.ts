import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  type IInventoriesRepository,
  INVENTORIES_REPOSITORY,
} from '../../../domain/inventories.repository';
import { DecreaseBatchStockCommand } from './decrease-batch-stock.command';

@CommandHandler(DecreaseBatchStockCommand)
export class DecreaseBatchStockHandler implements ICommandHandler<DecreaseBatchStockCommand> {
  public constructor(
    @Inject(INVENTORIES_REPOSITORY)
    private readonly inventoriesRepository: IInventoriesRepository,
  ) {}

  public async execute(command: DecreaseBatchStockCommand): Promise<number> {
    return this.inventoriesRepository.adjustBatchStock(
      command.productId,
      command.batchId,
      -command.quantity,
    );
  }
}

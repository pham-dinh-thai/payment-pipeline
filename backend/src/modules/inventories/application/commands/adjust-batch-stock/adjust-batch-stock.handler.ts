import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AdjustBatchStockCommand } from './adjust-batch-stock.command';
import { Inject, NotFoundException } from '@nestjs/common';
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

  public async execute(command: AdjustBatchStockCommand): Promise<void> {
    const inventory = await this.inventoriesRepository.findByProductId(
      command.productId,
    );

    if (!inventory) {
      throw new NotFoundException(
        `Inventory with productId ${command.productId} not found`,
      );
    }

    inventory.adjustStock(command.batchId, command.delta);

    await this.inventoriesRepository.save(inventory);
  }
}

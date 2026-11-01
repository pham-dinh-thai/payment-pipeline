import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IncreaseBatchStockCommand } from './increase-batch-stock.command';
import { Inject, NotFoundException } from '@nestjs/common';
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

  public async execute(command: IncreaseBatchStockCommand): Promise<void> {
    const inventory = await this.inventoriesRepository.findByProductId(
      command.productId,
    );

    if (!inventory) {
      throw new NotFoundException(
        `Inventory with productId ${command.productId} not found`,
      );
    }

    inventory.increaseStock(command.batchId, command.quantity);

    await this.inventoriesRepository.save(inventory);
  }
}

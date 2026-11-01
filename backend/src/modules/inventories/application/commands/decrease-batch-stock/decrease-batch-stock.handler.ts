import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
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

  public async execute(command: DecreaseBatchStockCommand): Promise<void> {
    const inventory = await this.inventoriesRepository.findByProductId(
      command.productId,
    );

    if (!inventory) {
      throw new NotFoundException(
        `Inventory with productId ${command.productId} not found`,
      );
    }

    inventory.decreaseStock(command.batchId, command.quantity);

    await this.inventoriesRepository.save(inventory);
  }
}

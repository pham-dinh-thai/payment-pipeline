import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IssueBatchStockCommand } from './issue-batch-stock.command';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  type IInventoriesRepository,
  INVENTORIES_REPOSITORY,
} from '../../../domain/inventories.repository';

@CommandHandler(IssueBatchStockCommand)
export class IssueBatchStockHandler implements ICommandHandler<IssueBatchStockCommand> {
  public constructor(
    @Inject(INVENTORIES_REPOSITORY)
    private readonly inventoriesRepository: IInventoriesRepository,
  ) {}

  public async execute(command: IssueBatchStockCommand): Promise<number> {
    const inventory = await this.inventoriesRepository.findByProductId(
      command.productId,
      { forUpdate: true },
    );

    if (!inventory) {
      throw new NotFoundException(
        `Inventory with productId ${command.productId} not found`,
      );
    }

    const quantity = inventory.issueStock(command.batchId, command.quantity);

    await this.inventoriesRepository.save(inventory);

    return quantity;
  }
}

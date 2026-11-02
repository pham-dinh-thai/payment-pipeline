import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReconcileBatchStockCommand } from './reconcile-batch-stock.command';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  type IInventoriesRepository,
  INVENTORIES_REPOSITORY,
} from '../../../domain/inventories.repository';

@CommandHandler(ReconcileBatchStockCommand)
export class ReconcileBatchStockHandler implements ICommandHandler<ReconcileBatchStockCommand> {
  public constructor(
    @Inject(INVENTORIES_REPOSITORY)
    private readonly inventoriesRepository: IInventoriesRepository,
  ) {}

  public async execute(command: ReconcileBatchStockCommand): Promise<number> {
    const inventory = await this.inventoriesRepository.findByProductId(
      command.productId,
      { forUpdate: true },
    );

    if (!inventory) {
      throw new NotFoundException(
        `Inventory with productId ${command.productId} not found`,
      );
    }

    const quantity = inventory.reconcileStock(
      command.batchId,
      command.countedQuantity,
    );

    await this.inventoriesRepository.save(inventory);

    return quantity;
  }
}

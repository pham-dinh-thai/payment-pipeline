import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReconcileBatchStockCommand } from './reconcile-batch-stock.command';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  type IInventoriesRepository,
  INVENTORIES_REPOSITORY,
} from '../../../domain/inventories.repository';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/application/unit-of-work';

@CommandHandler(ReconcileBatchStockCommand)
export class ReconcileBatchStockHandler implements ICommandHandler<ReconcileBatchStockCommand> {
  public constructor(
    @Inject(INVENTORIES_REPOSITORY)
    private readonly inventoriesRepository: IInventoriesRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(command: ReconcileBatchStockCommand): Promise<number> {
    return this.unitOfWork.run(async () => {
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
    });
  }
}

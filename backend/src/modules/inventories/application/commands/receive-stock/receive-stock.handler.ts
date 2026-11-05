import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReceiveStockCommand } from './receive-stock.command';
import {
  type IInventoriesRepository,
  INVENTORIES_REPOSITORY,
} from '../../../domain/inventories.repository';
import { Inject } from '@nestjs/common';
import { Inventory } from '../../../domain/inventory.aggregate';
import { BatchStatus } from '../../../domain/batch/batch-status.enum';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/application/unit-of-work';

@CommandHandler(ReceiveStockCommand)
export class ReceiveStockHandler implements ICommandHandler<ReceiveStockCommand> {
  public constructor(
    @Inject(INVENTORIES_REPOSITORY)
    private readonly inventoriesRepository: IInventoriesRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(
    command: ReceiveStockCommand,
  ): Promise<{ batchId: string }> {
    return this.unitOfWork.run(async () => {
      let inventory = await this.inventoriesRepository.findByProductId(
        command.productId,
      );

      if (!inventory) {
        inventory = Inventory.create(command.productId);
      }

      const { batchId } = inventory.addBatch({
        lotNumber: command.lotNumber,
        productId: command.productId,
        quantity: command.quantity,
        unitCost: command.unitCost,
        status: BatchStatus.ACTIVE,
        expiresAt: command.expiresAt,
        createdBy: command.createdBy,
      });

      await this.inventoriesRepository.save(inventory);

      return { batchId };
    });
  }
}

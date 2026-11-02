import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddBatchCommand } from './add-batch.command';
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
import { Transactional } from '../../../../../shared/application/transactional.decorator';

@CommandHandler(AddBatchCommand)
export class AddBatchHandler implements ICommandHandler<AddBatchCommand> {
  public constructor(
    @Inject(INVENTORIES_REPOSITORY)
    private readonly inventoriesRepository: IInventoriesRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  @Transactional()
  public async execute(command: AddBatchCommand): Promise<{ batchId: string }> {
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
  }
}

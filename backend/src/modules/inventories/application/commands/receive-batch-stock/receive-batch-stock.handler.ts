import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReceiveBatchStockCommand } from './receive-batch-stock.command';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  type IInventoriesRepository,
  INVENTORIES_REPOSITORY,
} from '../../../domain/inventories.repository';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/application/unit-of-work';
import { Transactional } from '../../../../../shared/application/transactional.decorator';

@CommandHandler(ReceiveBatchStockCommand)
export class ReceiveBatchStockHandler implements ICommandHandler<ReceiveBatchStockCommand> {
  public constructor(
    @Inject(INVENTORIES_REPOSITORY)
    private readonly inventoriesRepository: IInventoriesRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  @Transactional()
  public async execute(command: ReceiveBatchStockCommand): Promise<number> {
    const inventory = await this.inventoriesRepository.findByProductId(
      command.productId,
      { forUpdate: true },
    );

    if (!inventory) {
      throw new NotFoundException(
        `Inventory with productId ${command.productId} not found`,
      );
    }

    const quantity = inventory.receiveStock(command.batchId, command.quantity);

    await this.inventoriesRepository.save(inventory);

    return quantity;
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddBatchCommand } from './add-batch.command';
import {
  type IInventoriesRepository,
  INVENTORIES_REPOSITORY,
} from '../../../domain/inventories.repository';
import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { Inventory } from '../../../domain/inventory.aggregate';
import { BatchStatus } from '../../../domain/batch/batch-status.enum';
import {
  type IProductsRepository,
  PRODUCTS_REPOSITORY,
} from '../../../../products/domain/products.repository';
import { UniqueConstraintViolationException } from '@mikro-orm/core';

@CommandHandler(AddBatchCommand)
export class AddBatchHandler implements ICommandHandler<AddBatchCommand> {
  public constructor(
    @Inject(INVENTORIES_REPOSITORY)
    private readonly inventoriesRepository: IInventoriesRepository,

    @Inject(PRODUCTS_REPOSITORY)
    private readonly productsRepository: IProductsRepository,
  ) {}

  public async execute(command: AddBatchCommand): Promise<{ batchId: string }> {
    if (!(await this.productsRepository.existsById(command.productId))) {
      throw new NotFoundException(`Product id ${command.productId} not found`);
    }

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

    try {
      await this.inventoriesRepository.save(inventory);
    } catch (e) {
      if (e instanceof UniqueConstraintViolationException) {
        throw new ConflictException(
          `Lot ${command.lotNumber} already exists for product ${command.productId}`,
        );
      }

      throw e;
    }

    return { batchId };
  }
}

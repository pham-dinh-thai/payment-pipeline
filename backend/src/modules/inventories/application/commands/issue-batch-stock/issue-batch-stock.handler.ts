import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IssueBatchStockCommand } from './issue-batch-stock.command';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  type IInventoriesRepository,
  INVENTORIES_REPOSITORY,
} from '../../../domain/inventories.repository';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/modules/unit-of-work/unit-of-work';
import {
  type IOutboxRepository,
  OUTBOX_REPOSITORY,
} from '../../../../../shared/modules/outbox/domain/outbox.repository';
import { INVENTORY_STOCK_ISSUED_EVENT } from '../../../domain/events/inventory-stock-issued.event';
import { auditEventPayload } from '../../../../audit-logs/domain/events/audit-event.payload';
import { EntityType } from '../../../../audit-logs/domain/enums/entity-type.enum';

@CommandHandler(IssueBatchStockCommand)
export class IssueBatchStockHandler implements ICommandHandler<IssueBatchStockCommand> {
  public constructor(
    @Inject(INVENTORIES_REPOSITORY)
    private readonly inventoriesRepository: IInventoriesRepository,

    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepository: IOutboxRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(command: IssueBatchStockCommand): Promise<number> {
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

      const batch = inventory
        .getBatches()
        .find((item) => item.getId() === command.batchId);

      if (!batch) {
        throw new NotFoundException(`Batch id ${command.batchId} not found`);
      }

      const beforeQuantity = batch.getQuantity();

      const quantity = inventory.issueStock(command.batchId, command.quantity);

      await this.inventoriesRepository.save(inventory);

      await this.outboxRepository.create({
        eventType: INVENTORY_STOCK_ISSUED_EVENT,
        payload: auditEventPayload(command.headers, {
          entityType: EntityType.INVENTORIES,
          entityId: batch.getProductId(),
          before: { quantity: beforeQuantity },
          after: {
            productId: batch.getProductId(),
            batchId: batch.getId(),
            lotNumber: batch.getLotNumber(),
            quantity: batch.getQuantity(),
            unitCost: batch.getUnitCost(),
            status: batch.getStatus(),
            expiresAt: batch.getExpiresAt().toISOString(),
          },
          metadata: { batchId: batch.getId() },
        }),
      });

      return quantity;
    });
  }
}

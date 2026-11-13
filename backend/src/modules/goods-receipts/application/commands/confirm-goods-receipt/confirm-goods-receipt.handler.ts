import { Inject, NotFoundException } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  type IGoodsReceiptsRepository,
  GOODS_RECEIPTS_REPOSITORY,
} from '../../../domain/goods-receipts.repository';
import { ReceiveStockCommand } from '../../../../inventories/application/commands/receive-stock/receive-stock.command';
import { goodsReceiptSnapshot } from '../../../domain/goods-receipt.snapshot';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/modules/unit-of-work/unit-of-work';
import {
  type IOutboxRepository,
  OUTBOX_REPOSITORY,
} from '../../../../../shared/modules/outbox/domain/outbox.repository';
import { ConfirmGoodsReceiptCommand } from './confirm-goods-receipt.command';
import { GOODS_RECEIPT_CONFIRMED_EVENT } from '../../../domain/events/goods-receipt-confirmed.event';
import { auditEventPayload } from '../../../../audit-logs/domain/events/audit-event.payload';
import { EntityType } from '../../../../audit-logs/domain/enums/entity-type.enum';

@CommandHandler(ConfirmGoodsReceiptCommand)
export class ConfirmGoodsReceiptHandler implements ICommandHandler<ConfirmGoodsReceiptCommand> {
  public constructor(
    @Inject(GOODS_RECEIPTS_REPOSITORY)
    private readonly goodsReceiptsRepository: IGoodsReceiptsRepository,

    private readonly commandBus: CommandBus,

    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepository: IOutboxRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public execute(command: ConfirmGoodsReceiptCommand): Promise<{ id: string }> {
    return this.unitOfWork.run(async () => {
      const goodsReceipt = await this.goodsReceiptsRepository.findById(
        command.id,
        { forUpdate: true },
      );

      if (!goodsReceipt) {
        throw new NotFoundException(`Goods receipt id ${command.id} not found`);
      }

      const previousStatus = goodsReceipt.getStatus();

      goodsReceipt.confirm(command.confirmedBy);

      for (const line of goodsReceipt.getGoodsReceiptLines()) {
        const { batchId } = await this.commandBus.execute(
          new ReceiveStockCommand(
            line.getLotNumber(),
            line.getProductId(),
            line.getQuantity(),
            line.getUnitCost(),
            line.getExpiresAt(),
            command.confirmedBy,
          ),
        );

        goodsReceipt.attachBatch(line.getId(), batchId);
      }

      await this.goodsReceiptsRepository.update(goodsReceipt);

      await this.outboxRepository.create({
        eventType: GOODS_RECEIPT_CONFIRMED_EVENT,
        payload: auditEventPayload(command.headers, {
          entityType: EntityType.GOODS_RECEIPTS,
          entityId: goodsReceipt.getId(),
          before: { status: previousStatus },
          after: goodsReceiptSnapshot(goodsReceipt),
        }),
      });

      return { id: goodsReceipt.getId() };
    });
  }
}

import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  type IGoodsReceiptsRepository,
  GOODS_RECEIPTS_REPOSITORY,
} from '../../../domain/goods-receipts.repository';
import { goodsReceiptSnapshot } from '../../../domain/goods-receipt.snapshot';
import { type GoodsReceipt } from '../../../domain/goods-receipt.aggregate';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/modules/unit-of-work/unit-of-work';
import {
  type IOutboxRepository,
  OUTBOX_REPOSITORY,
} from '../../../../../shared/modules/outbox/domain/outbox.repository';
import { Id } from '../../../../../shared/value-objects/id.value-object';
import { ConfirmGoodsReceiptCommand } from './confirm-goods-receipt.command';
import {
  GOODS_RECEIPT_CONFIRMED_EVENT,
  GOODS_RECEIPT_STOCK_RECEIVED_EVENT,
  type GoodsReceiptStockReceivedLine,
} from '../../../domain/events/goods-receipt-confirmed.event';
import { auditEventPayload } from '../../../../audit-logs/domain/events/audit-event.payload';
import { EntityType } from '../../../../audit-logs/domain/enums/entity-type.enum';

@CommandHandler(ConfirmGoodsReceiptCommand)
export class ConfirmGoodsReceiptHandler implements ICommandHandler<ConfirmGoodsReceiptCommand> {
  public constructor(
    @Inject(GOODS_RECEIPTS_REPOSITORY)
    private readonly goodsReceiptsRepository: IGoodsReceiptsRepository,

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

      const stockLines = this.prepareStockLines(goodsReceipt);

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

      await this.outboxRepository.create({
        eventType: GOODS_RECEIPT_STOCK_RECEIVED_EVENT,
        payload: {
          goodsReceiptId: goodsReceipt.getId(),
          confirmedBy: command.confirmedBy,
          lines: stockLines,
        },
      });

      return { id: goodsReceipt.getId() };
    });
  }

  /**
   * Batch ids are generated here, before the inventory consumer runs, so the
   * goods receipt lines already reference the batches they will receive. This
   * also makes the consumer idempotent: replaying the event inserts nothing.
   */
  private prepareStockLines(
    goodsReceipt: GoodsReceipt,
  ): GoodsReceiptStockReceivedLine[] {
    return goodsReceipt.getGoodsReceiptLines().map((line) => {
      const batchId = Id.generate().getValue();

      goodsReceipt.attachBatch(line.getId(), batchId);

      return {
        batchId,
        productId: line.getProductId(),
        lotNumber: line.getLotNumber(),
        quantity: line.getQuantity(),
        unitCost: line.getUnitCost(),
        expiresAt: line.getExpiresAt().toISOString(),
      };
    });
  }
}

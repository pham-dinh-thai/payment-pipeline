import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  type IGoodsReceiptsRepository,
  GOODS_RECEIPTS_REPOSITORY,
} from '../../../domain/goods-receipts.repository';
import { goodsReceiptSnapshot } from '../../../domain/goods-receipt.snapshot';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/modules/unit-of-work/unit-of-work';
import {
  type IOutboxRepository,
  OUTBOX_REPOSITORY,
} from '../../../../../shared/modules/outbox/domain/outbox.repository';
import { CancelGoodsReceiptCommand } from './cancel-goods-receipt.command';
import { GOODS_RECEIPT_CANCELLED_EVENT } from '../../../domain/events/goods-receipt-cancelled.event';
import { auditEventPayload } from '../../../../audit-logs/domain/events/audit-event.payload';
import { EntityType } from '../../../../audit-logs/domain/enums/entity-type.enum';

@CommandHandler(CancelGoodsReceiptCommand)
export class CancelGoodsReceiptHandler implements ICommandHandler<CancelGoodsReceiptCommand> {
  public constructor(
    @Inject(GOODS_RECEIPTS_REPOSITORY)
    private readonly goodsReceiptsRepository: IGoodsReceiptsRepository,

    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepository: IOutboxRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public execute(command: CancelGoodsReceiptCommand): Promise<{ id: string }> {
    return this.unitOfWork.run(async () => {
      const goodsReceipt = await this.goodsReceiptsRepository.findById(
        command.id,
        { forUpdate: true },
      );

      if (!goodsReceipt) {
        throw new NotFoundException(`Goods receipt id ${command.id} not found`);
      }

      const previousStatus = goodsReceipt.getStatus();

      goodsReceipt.cancel(command.cancelledBy);

      await this.goodsReceiptsRepository.update(goodsReceipt);

      await this.outboxRepository.create({
        eventType: GOODS_RECEIPT_CANCELLED_EVENT,
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

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  type IGoodsReceiptsRepository,
  GOODS_RECEIPTS_REPOSITORY,
} from '../../../domain/goods-receipts.repository';
import { GoodsReceipt } from '../../../domain/goods-receipt.aggregate';
import { GoodsReceiptLine } from '../../../domain/goods-receipt-line.entity';
import { goodsReceiptSnapshot } from '../../../domain/goods-receipt.snapshot';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/modules/unit-of-work/unit-of-work';
import {
  type IOutboxRepository,
  OUTBOX_REPOSITORY,
} from '../../../../../shared/modules/outbox/domain/outbox.repository';
import { CreateGoodsReceiptCommand } from './create-goods-receipt.command';
import { GOODS_RECEIPT_CREATED_EVENT } from '../../../domain/events/goods-receipt-created.event';
import { auditEventPayload } from '../../../../audit-logs/domain/events/audit-event.payload';
import { EntityType } from '../../../../audit-logs/domain/enums/entity-type.enum';

@CommandHandler(CreateGoodsReceiptCommand)
export class CreateGoodsReceiptHandler implements ICommandHandler<CreateGoodsReceiptCommand> {
  public constructor(
    @Inject(GOODS_RECEIPTS_REPOSITORY)
    private readonly goodsReceiptsRepository: IGoodsReceiptsRepository,

    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepository: IOutboxRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public execute(
    command: CreateGoodsReceiptCommand,
  ): Promise<{ id: string; code: string }> {
    return this.unitOfWork.run(async () => {
      const sequence = await this.goodsReceiptsRepository.nextSequence();

      const goodsReceipt = GoodsReceipt.create({
        sequence,
        supplierId: command.supplierId,
        goodsReceiptLines: command.lines.map((line) =>
          GoodsReceiptLine.create({
            lotNumber: line.lotNumber,
            productId: line.productId,
            quantity: line.quantity,
            unitCost: line.unitCost,
            expiresAt: line.expiresAt,
          }),
        ),
        createdBy: command.createdBy,
      });

      await this.goodsReceiptsRepository.create(goodsReceipt);

      await this.outboxRepository.create({
        eventType: GOODS_RECEIPT_CREATED_EVENT,
        payload: auditEventPayload(command.headers, {
          entityType: EntityType.GOODS_RECEIPTS,
          entityId: goodsReceipt.getId(),
          after: goodsReceiptSnapshot(goodsReceipt),
        }),
      });

      return { id: goodsReceipt.getId(), code: goodsReceipt.getCode() };
    });
  }
}

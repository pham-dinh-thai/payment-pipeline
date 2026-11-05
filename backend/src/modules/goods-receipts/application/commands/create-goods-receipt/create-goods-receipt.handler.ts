import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  type IGoodsReceiptsRepository,
  GOODS_RECEIPTS_REPOSITORY,
} from '../../../domain/goods-receipts.repository';
import { GoodsReceipt } from '../../../domain/goods-receipt.aggregate';
import { GoodsReceiptLine } from '../../../domain/goods-receipt-line.entity';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/application/unit-of-work';
import { CreateGoodsReceiptCommand } from './create-goods-receipt.command';

@CommandHandler(CreateGoodsReceiptCommand)
export class CreateGoodsReceiptHandler implements ICommandHandler<CreateGoodsReceiptCommand> {
  public constructor(
    @Inject(GOODS_RECEIPTS_REPOSITORY)
    private readonly goodsReceiptsRepository: IGoodsReceiptsRepository,

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

      return { id: goodsReceipt.getId(), code: goodsReceipt.getCode() };
    });
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  type IGoodsReceiptsRepository,
  GOODS_RECEIPTS_REPOSITORY,
} from '../../../domain/goods-receipts.repository';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/application/unit-of-work';
import { CancelGoodsReceiptCommand } from './cancel-goods-receipt.command';

@CommandHandler(CancelGoodsReceiptCommand)
export class CancelGoodsReceiptHandler implements ICommandHandler<CancelGoodsReceiptCommand> {
  public constructor(
    @Inject(GOODS_RECEIPTS_REPOSITORY)
    private readonly goodsReceiptsRepository: IGoodsReceiptsRepository,

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

      goodsReceipt.cancel(command.cancelledBy);

      await this.goodsReceiptsRepository.update(goodsReceipt);

      return { id: goodsReceipt.getId() };
    });
  }
}

import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { GoodsReceiptsController } from './presentation/goods-receipts/goods-receipts.controller';
import { GOODS_RECEIPTS_REPOSITORY } from './domain/goods-receipts.repository';
import { MikroGoodsReceipt } from './infrastructure/entities/mikro-goods-receipt.entity';
import { MikroGoodsReceiptLine } from './infrastructure/entities/mikro-goods-receipt-line.entity';
import { MikroGoodsReceiptsRepository } from './infrastructure/repositories/mikro-goods-receipts.repository';
import { UNIT_OF_WORK } from '../../shared/application/unit-of-work';
import { MikroUnitOfWork } from '../../shared/infrastructure/persistence/mikro-unit-of-work';

@Module({
  imports: [
    MikroOrmModule.forFeature([MikroGoodsReceipt, MikroGoodsReceiptLine]),
  ],
  controllers: [GoodsReceiptsController],
  providers: [
    {
      provide: GOODS_RECEIPTS_REPOSITORY,
      useClass: MikroGoodsReceiptsRepository,
    },
    { provide: UNIT_OF_WORK, useClass: MikroUnitOfWork },
  ],
  exports: [GOODS_RECEIPTS_REPOSITORY],
})
export class GoodsReceiptsModule {}

import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { GoodsReceiptsController } from './presentation/goods-receipts/goods-receipts.controller';
import { GOODS_RECEIPTS_REPOSITORY } from './domain/goods-receipts.repository';
import { MikroGoodsReceipt } from './infrastructure/entities/mikro-goods-receipt.entity';
import { MikroGoodsReceiptLine } from './infrastructure/entities/mikro-goods-receipt-line.entity';
import { MikroGoodsReceiptsRepository } from './infrastructure/repositories/mikro-goods-receipts.repository';
import { CreateGoodsReceiptHandler } from './application/commands/create-goods-receipt/create-goods-receipt.handler';
import { ConfirmGoodsReceiptHandler } from './application/commands/confirm-goods-receipt/confirm-goods-receipt.handler';
import { CancelGoodsReceiptHandler } from './application/commands/cancel-goods-receipt/cancel-goods-receipt.handler';
import { SecurityModule } from '../../shared/modules/security/security.module';
import { OutBoxModule } from '../../shared/modules/outbox/outbox.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([MikroGoodsReceipt, MikroGoodsReceiptLine]),
    SecurityModule,
    OutBoxModule,
  ],
  controllers: [GoodsReceiptsController],
  providers: [
    {
      provide: GOODS_RECEIPTS_REPOSITORY,
      useClass: MikroGoodsReceiptsRepository,
    },
    CreateGoodsReceiptHandler,
    ConfirmGoodsReceiptHandler,
    CancelGoodsReceiptHandler,
  ],
})
export class GoodsReceiptsModule {}

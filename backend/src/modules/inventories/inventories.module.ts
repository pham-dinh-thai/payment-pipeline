import { Module } from '@nestjs/common';
import { InventoriesController } from './presentation/inventories/inventories.controller';
import { INVENTORIES_REPOSITORY } from './domain/inventories.repository';
import { MikroInventoriesRepository } from './infrastructure/repositories/mikro-inventories.repository';
import { ReceiveStockHandler } from './application/commands/receive-stock/receive-stock.handler';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MikroBatch } from './infrastructure/entities/mikro-batch.entity';
import { MikroInventory } from './infrastructure/entities/mikro-inventory.entity';
import { ReconcileBatchStockHandler } from './application/commands/reconcile-batch-stock/reconcile-batch-stock.handler';
import { IssueBatchStockHandler } from './application/commands/issue-batch-stock/issue-batch-stock.handler';
import { SecurityModule } from '../../shared/modules/security/security.module';
import { OutBoxModule } from '../../shared/modules/outbox/outbox.module';
import { GoodsReceiptStockReceivedConsumer } from './application/consumers/goods-receipt-stock-received.consumer';

@Module({
  imports: [
    MikroOrmModule.forFeature([MikroBatch, MikroInventory]),
    SecurityModule,
    OutBoxModule,
  ],
  controllers: [InventoriesController],
  providers: [
    { provide: INVENTORIES_REPOSITORY, useClass: MikroInventoriesRepository },
    ReceiveStockHandler,
    ReconcileBatchStockHandler,
    IssueBatchStockHandler,
    GoodsReceiptStockReceivedConsumer,
  ],
})
export class InventoriesModule {}

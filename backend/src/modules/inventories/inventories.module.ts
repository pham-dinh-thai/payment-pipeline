import { Module } from '@nestjs/common';
import { InventoriesController } from './presentation/inventories/inventories.controller';
import { INVENTORIES_REPOSITORY } from './domain/inventories.repository';
import { MikroInventoriesRepository } from './infrastructure/repositories/mikro-inventories.repository';
import { AddBatchHandler } from './application/commands/add-batch/add-batch.handler';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MikroBatch } from './infrastructure/entities/mikro-batch.entity';
import { MikroInventory } from './infrastructure/entities/mikro-inventory.entity';
import { ReconcileBatchStockHandler } from './application/commands/reconcile-batch-stock/reconcile-batch-stock.handler';
import { ReceiveBatchStockHandler } from './application/commands/receive-batch-stock/receive-batch-stock.handler';
import { IssueBatchStockHandler } from './application/commands/issue-batch-stock/issue-batch-stock.handler';

@Module({
  imports: [MikroOrmModule.forFeature([MikroBatch, MikroInventory])],
  controllers: [InventoriesController],
  providers: [
    { provide: INVENTORIES_REPOSITORY, useClass: MikroInventoriesRepository },
    AddBatchHandler,
    ReconcileBatchStockHandler,
    ReceiveBatchStockHandler,
    IssueBatchStockHandler,
  ],
})
export class InventoriesModule {}

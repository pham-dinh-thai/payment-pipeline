import { Module } from '@nestjs/common';
import { InventoriesController } from './presentation/inventories/inventories.controller';
import { INVENTORIES_REPOSITORY } from './domain/inventories.repository';
import { MikroInventoriesRepository } from './infrastructure/repositories/mikro-inventories.repository';
import { AddBatchHandler } from './application/commands/add-batch/add-batch.handler';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MikroBatch } from './infrastructure/entities/mikro-batch.entity';
import { MikroInventory } from './infrastructure/entities/mikro-inventory.entity';
import { AdjustBatchStockHandler } from './application/commands/adjust-batch-stock/adjust-batch-stock.handler';
import { IncreaseBatchStockHandler } from './application/commands/increase-batch-stock/increase-batch-stock.handler';
import { DecreaseBatchStockHandler } from './application/commands/decrease-batch-stock/decrease-batch-stock.handler';

@Module({
  imports: [MikroOrmModule.forFeature([MikroBatch, MikroInventory])],
  controllers: [InventoriesController],
  providers: [
    { provide: INVENTORIES_REPOSITORY, useClass: MikroInventoriesRepository },
    AddBatchHandler,
    AdjustBatchStockHandler,
    IncreaseBatchStockHandler,
    DecreaseBatchStockHandler,
  ],
})
export class InventoriesModule {}

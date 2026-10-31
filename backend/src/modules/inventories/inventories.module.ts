import { Module } from '@nestjs/common';
import { InventoriesController } from './presentation/inventories/inventories.controller';
import { INVENTORIES_REPOSITORY } from './domain/inventories.repository';
import { MikroInventoriesRepository } from './infrastructure/repositories/mikro-inventories.repository';
import { AddBatchHandler } from './application/commands/add-batch/add-batch.handler';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MikroBatch } from './infrastructure/entities/mikro-batch.entity';
import { MikroInventory } from './infrastructure/entities/mikro-inventory.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([MikroBatch, MikroInventory]),
    ProductsModule,
  ],
  controllers: [InventoriesController],
  providers: [
    { provide: INVENTORIES_REPOSITORY, useClass: MikroInventoriesRepository },
    AddBatchHandler,
  ],
})
export class InventoriesModule {}

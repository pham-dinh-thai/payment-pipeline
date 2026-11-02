import { Module } from '@nestjs/common';
import { SuppliersController } from './presentation/suppliers/suppliers.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MikroSupplier } from './infrastructure/entities/mikro-supplier.entity';

@Module({
  imports: [MikroOrmModule.forFeature([MikroSupplier])],
  controllers: [SuppliersController],
})
export class SuppliersModule {}

import { Module } from '@nestjs/common';
import { SuppliersController } from './presentation/suppliers/suppliers.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MikroSupplier } from './infrastructure/entities/mikro-supplier.entity';
import { SUPPLIERS_REPOSITORY } from './domain/suppliers.repository';
import { MikroSuppliersRepository } from './infrastructure/repositories/mikro-suppliers.repository';
import { CreateSupplierHandler } from './application/commands/create-supplier/create-supplier.handler';
import { UpdateSupplierHandler } from './application/commands/update-supplier/update-supplier.handler';
import { UNIT_OF_WORK } from '../../shared/application/unit-of-work';
import { MikroUnitOfWork } from '../../shared/infrastructure/persistence/mikro-unit-of-work';

@Module({
  imports: [MikroOrmModule.forFeature([MikroSupplier])],
  controllers: [SuppliersController],
  providers: [
    { provide: SUPPLIERS_REPOSITORY, useClass: MikroSuppliersRepository },
    { provide: UNIT_OF_WORK, useClass: MikroUnitOfWork },
    CreateSupplierHandler,
    UpdateSupplierHandler,
  ],
})
export class SuppliersModule {}

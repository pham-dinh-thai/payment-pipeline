import { Module } from '@nestjs/common';
import { SuppliersController } from './presentation/suppliers/suppliers.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MikroSupplier } from './infrastructure/entities/mikro-supplier.entity';
import { SUPPLIERS_REPOSITORY } from './domain/suppliers.repository';
import { MikroSuppliersRepository } from './infrastructure/repositories/mikro-suppliers.repository';
import { CreateSupplierHandler } from './application/commands/create-supplier/create-supplier.handler';
import { UpdateSupplierHandler } from './application/commands/update-supplier/update-supplier.handler';
import { GetSuppliersHandler } from './application/queries/get-suppliers/get-suppliers.handler';
import { DeactivateSupplierHandler } from './application/commands/deactivate-supplier/deactivate-supplier.handler';
import { ActivateSupplierHandler } from './application/commands/activate-supplier/activate-supplier.handler';

@Module({
  imports: [MikroOrmModule.forFeature([MikroSupplier])],
  controllers: [SuppliersController],
  providers: [
    { provide: SUPPLIERS_REPOSITORY, useClass: MikroSuppliersRepository },
    CreateSupplierHandler,
    UpdateSupplierHandler,
    GetSuppliersHandler,
    DeactivateSupplierHandler,
    ActivateSupplierHandler,
  ],
})
export class SuppliersModule {}

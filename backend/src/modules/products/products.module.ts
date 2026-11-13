import { Module } from '@nestjs/common';
import { PRODUCTS_REPOSITORY } from './domain/products.repository';
import { MikroProductsRepository } from './infrastructure/repositories/mikro-products.repository';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MikroProduct } from './infrastructure/entities/mikro-product.entity';
import { ProductsController } from './presentation/products/products.controller';
import { CreateProductHandler } from './application/commands/create-product/create-product.handler';
import { GetProductsHandler } from './application/queries/get-products/get-products.handler';
import { SecurityModule } from '../../shared/modules/security/security.module';
import { OutBoxModule } from '../../shared/modules/outbox/outbox.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([MikroProduct]),
    SecurityModule,
    OutBoxModule,
  ],
  providers: [
    { provide: PRODUCTS_REPOSITORY, useClass: MikroProductsRepository },
    CreateProductHandler,
    GetProductsHandler,
  ],
  controllers: [ProductsController],
  exports: [PRODUCTS_REPOSITORY],
})
export class ProductsModule {}

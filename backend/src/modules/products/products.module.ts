import { Module } from '@nestjs/common';
import { PRODUCTS_REPOSITORY } from './domain/products.repository';
import { MikroProductsRepository } from './infrastructure/repositories/mikro-products.repository';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MikroProduct } from './infrastructure/entities/mikro-product.entity';
import { ProductsController } from './presentation/products/products.controller';
import { CreateProductHandler } from './application/commands/create-product/create-product.handler';

@Module({
  imports: [MikroOrmModule.forFeature([MikroProduct])],
  providers: [
    { provide: PRODUCTS_REPOSITORY, useClass: MikroProductsRepository },
    CreateProductHandler,
  ],
  controllers: [ProductsController],
})
export class ProductsModule {}

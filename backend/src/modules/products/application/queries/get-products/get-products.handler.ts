import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProductsQuery } from './get-products.query';
import { Inject } from '@nestjs/common';
import {
  type IProductsRepository,
  PRODUCTS_REPOSITORY,
} from '../../../domain/products.repository';
import { ProductListItemReadModel } from './product-list-item.read-model';

@QueryHandler(GetProductsQuery)
export class GetProductsHandler implements IQueryHandler<
  GetProductsQuery,
  ProductListItemReadModel[]
> {
  public constructor(
    @Inject(PRODUCTS_REPOSITORY)
    private readonly productsRepository: IProductsRepository,
  ) {}

  public async execute(): Promise<ProductListItemReadModel[]> {
    const products = await this.productsRepository.findAll();

    return products.map(
      (product) =>
        new ProductListItemReadModel(
          product.getId(),
          product.getName(),
          product.getUnitPrice(),
          product.getQuantity(),
        ),
    );
  }
}

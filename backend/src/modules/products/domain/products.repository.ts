import { Product } from './product.aggregate';

export interface IProductsRepository {
  findAll(): Promise<Product[]>;

  create(product: Product): Promise<void>;
}

export const PRODUCTS_REPOSITORY = 'IProductsRepository';

import { Product } from './product.aggregate';

export interface IProductsRepository {
  create(product: Product): Promise<void>;
}

export const PRODUCTS_REPOSITORY = 'IProductsRepository';

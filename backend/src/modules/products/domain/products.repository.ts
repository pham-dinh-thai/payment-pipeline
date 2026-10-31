import { Product } from './product.aggregate';

export interface IProductsRepository {
  findAll(): Promise<Product[]>;

  findById(id: string): Promise<Product | null>;

  existsById(id: string): Promise<boolean>;

  create(product: Product): Promise<void>;
}

export const PRODUCTS_REPOSITORY = 'IProductsRepository';

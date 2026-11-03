import { Supplier } from './supplier.aggregate';

export interface ISuppliersRepository {
  nextSequence(): Promise<number>;

  save(supplier: Supplier): Promise<Supplier>;
}

export const SUPPLIERS_REPOSITORY = 'ISuppliersRepository';

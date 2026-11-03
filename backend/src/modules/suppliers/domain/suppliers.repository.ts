import { Supplier } from './supplier.aggregate';

export interface ISuppliersRepository {
  findById(id: string): Promise<Supplier | null>;

  nextSequence(): Promise<number>;

  create(supplier: Supplier): Promise<Supplier>;

  update(supplier: Supplier): Promise<Supplier>;
}

export const SUPPLIERS_REPOSITORY = 'ISuppliersRepository';

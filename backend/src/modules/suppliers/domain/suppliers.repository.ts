import { Supplier } from './supplier.aggregate';

export interface ISuppliersRepository {
  findAll(): Promise<Supplier[]>;

  findById(id: string): Promise<Supplier | null>;

  nextSequence(): Promise<number>;

  create(supplier: Supplier): Promise<Supplier>;

  update(supplier: Supplier): Promise<Supplier>;
}

export const SUPPLIERS_REPOSITORY = 'ISuppliersRepository';

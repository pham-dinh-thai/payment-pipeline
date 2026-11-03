import { describe, expect, it, jest } from '@jest/globals';
import { ISuppliersRepository } from '../../../domain/suppliers.repository';
import { Supplier } from '../../../domain/supplier.aggregate';
import { SupplierStatus } from '../../../domain/enums/supplier-status.enum';
import { GetSuppliersHandler } from './get-suppliers.handler';

type FindAll = () => Promise<Supplier[]>;
type FindById = (id: string) => Promise<Supplier | null>;
type NextSequence = () => Promise<number>;
type Create = (supplier: Supplier) => Promise<Supplier>;
type Update = (supplier: Supplier) => Promise<Supplier>;

const FIRST_ID = 'b3d7f2a8-7a0e-4f1c-9c1a-4d3f5e6a7b8c';
const SECOND_ID = '0ca741a6-ce41-4010-8148-f7b2a32aef1c';

const createSupplier = (
  id: string,
  code: string,
  name: string,
  createdAt: Date,
): Supplier =>
  Supplier.fromPersistent({
    id,
    code,
    name,
    status: SupplierStatus.ACTIVE,
    phone: '0901234567',
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@abc.vn`,
    address: '12 Nguyễn Huệ',
    taxCode: '0312345678',
    createdAt,
    updatedAt: createdAt,
  });

const setup = (suppliers: Supplier[]) => {
  const findAll = jest.fn<FindAll>(() => Promise.resolve(suppliers));

  const repository: ISuppliersRepository = {
    findAll,
    findById: jest.fn<FindById>(),
    nextSequence: jest.fn<NextSequence>(),
    create: jest.fn<Create>(),
    update: jest.fn<Update>(),
  };
  const handler = new GetSuppliersHandler(repository);

  return { handler, findAll };
};

describe('GetSuppliersHandler', () => {
  it('maps suppliers to list items and keeps repository order', async () => {
    const newest = createSupplier(
      FIRST_ID,
      'SUP-0002',
      'Công ty ABC',
      new Date('2026-02-01T00:00:00Z'),
    );
    const oldest = createSupplier(
      SECOND_ID,
      'SUP-0001',
      'Công ty XYZ',
      new Date('2026-01-01T00:00:00Z'),
    );
    const { handler, findAll } = setup([newest, oldest]);

    const result = await handler.execute();

    expect(findAll).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: FIRST_ID,
      code: 'SUP-0002',
      name: 'Công ty ABC',
      status: SupplierStatus.ACTIVE,
      phone: '0901234567',
      email: 'công.ty.abc@abc.vn',
      address: '12 Nguyễn Huệ',
      taxCode: '0312345678',
      createdAt: new Date('2026-02-01T00:00:00Z'),
      updatedAt: new Date('2026-02-01T00:00:00Z'),
    });
    expect(result[1].id).toBe(SECOND_ID);
    expect(result[1].code).toBe('SUP-0001');
  });

  it('returns an empty list when there are no suppliers', async () => {
    const { handler } = setup([]);

    await expect(handler.execute()).resolves.toEqual([]);
  });
});

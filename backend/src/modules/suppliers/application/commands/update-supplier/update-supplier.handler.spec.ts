import { describe, expect, it, jest } from '@jest/globals';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ISuppliersRepository } from '../../../domain/suppliers.repository';
import { Supplier } from '../../../domain/supplier.aggregate';
import { SupplierStatus } from '../../../domain/enums/supplier-status.enum';
import { IUnitOfWork } from '../../../../../shared/modules/unit-of-work/unit-of-work';
import { IOutboxRepository } from '../../../../../shared/modules/outbox/domain/outbox.repository';
import { UpdateSupplierCommand } from './update-supplier.command';
import { UpdateSupplierHandler } from './update-supplier.handler';
import { SUPPLIER_UPDATED_EVENT } from '../../../domain/events/supplier-updated.event';
import { EntityType } from '../../../../audit-logs/domain/enums/entity-type.enum';

type FindAll = () => Promise<Supplier[]>;
type FindById = (id: string) => Promise<Supplier | null>;
type NextSequence = () => Promise<number>;
type Create = (supplier: Supplier) => Promise<Supplier>;
type Update = (supplier: Supplier) => Promise<Supplier>;
type Run = (work: () => Promise<unknown>) => Promise<unknown>;

const SUPPLIER_ID = '0ca741a6-ce41-4010-8148-f7b2a32aef1c';

const headers = {
  actorId: '7d0d2c55-9a9d-4c7d-9f6a-3f7f5a1b2c3d',
  actorType: 'user',
  actorLabel: 'admin@example.com',
  userIp: '127.0.0.1',
  userAgent: 'jest',
};

const createCommand = (phone: string | null = '02838223344') =>
  new UpdateSupplierCommand(
    SUPPLIER_ID,
    'Công ty TNHH ABC (mới)',
    phone,
    'new@abc.vn',
    '99 Lê Lợi',
    '0312345678',
    headers,
  );

const createSupplier = () =>
  Supplier.fromPersistent({
    id: SUPPLIER_ID,
    code: 'SUP-0007',
    name: 'Công ty TNHH ABC',
    status: SupplierStatus.ACTIVE,
    phone: '0901234567',
    email: 'old@abc.vn',
    address: '12 Nguyễn Huệ',
    taxCode: '0311111111',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  });

const setup = (supplier: Supplier | null = createSupplier()) => {
  const findById = jest.fn<FindById>(() => Promise.resolve(supplier));
  const nextSequence = jest.fn<NextSequence>(() => Promise.resolve(1));
  const update = jest.fn<Update>((saved) => Promise.resolve(saved));
  const run = jest.fn<Run>((work) => work());
  const outboxCreate = jest
    .fn<IOutboxRepository['create']>()
    .mockResolvedValue(undefined);

  const repository: ISuppliersRepository = {
    findAll: jest.fn<FindAll>(),
    findById,
    nextSequence,
    create: jest.fn<Create>(),
    update,
  };
  const unitOfWork: IUnitOfWork = {
    run: run as unknown as IUnitOfWork['run'],
  };
  const handler = new UpdateSupplierHandler(
    repository,
    { create: outboxCreate } as unknown as IOutboxRepository,
    unitOfWork,
  );

  return { handler, findById, update, run, outboxCreate };
};

describe('UpdateSupplierHandler', () => {
  it('updates the supplier inside a unit of work and returns the new values', async () => {
    const { handler, findById, update, run, outboxCreate } = setup();

    const result = await handler.execute(createCommand());

    expect(result).toEqual({
      id: SUPPLIER_ID,
      name: 'Công ty TNHH ABC (mới)',
      phone: '02838223344',
      email: 'new@abc.vn',
      address: '99 Lê Lợi',
      taxCode: '0312345678',
    });
    expect(findById).toHaveBeenCalledWith(SUPPLIER_ID);
    expect(update).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledTimes(1);
    expect(run.mock.invocationCallOrder[0]).toBeLessThan(
      findById.mock.invocationCallOrder[0],
    );

    const saved = update.mock.calls[0][0];

    expect(saved).toBeInstanceOf(Supplier);
    expect(saved.getId()).toBe(SUPPLIER_ID);
    expect(saved.getCode()).toBe('SUP-0007');
    expect(saved.getName()).toBe('Công ty TNHH ABC (mới)');
    expect(saved.getEmail()).toBe('new@abc.vn');
    expect(saved.getAddress()).toBe('99 Lê Lợi');
    expect(saved.getTaxCode()).toBe('0312345678');

    expect(outboxCreate).toHaveBeenCalledWith({
      eventType: SUPPLIER_UPDATED_EVENT,
      payload: {
        headers,
        audit: {
          entityType: EntityType.SUPPLIERS,
          entityId: SUPPLIER_ID,
          before: {
            name: 'Công ty TNHH ABC',
            phone: '0901234567',
            email: 'old@abc.vn',
            address: '12 Nguyễn Huệ',
            taxCode: '0311111111',
          },
          after: {
            name: 'Công ty TNHH ABC (mới)',
            phone: '02838223344',
            email: 'new@abc.vn',
            address: '99 Lê Lợi',
            taxCode: '0312345678',
          },
        },
      },
    });
  });

  it('normalizes +84 phone numbers before saving', async () => {
    const { handler, update } = setup();

    const result = await handler.execute(createCommand('+84901234567'));

    expect(result.phone).toBe('0901234567');
    expect(update.mock.calls[0][0].getPhone()).toBe('0901234567');
  });

  it('throws NotFoundException and does not save when the supplier is missing', async () => {
    const { handler, update, outboxCreate } = setup(null);

    await expect(handler.execute(createCommand())).rejects.toThrow(
      NotFoundException,
    );

    expect(update).not.toHaveBeenCalled();
    expect(outboxCreate).not.toHaveBeenCalled();
  });

  it('does not save when the phone is invalid', async () => {
    const { handler, update, outboxCreate } = setup();

    await expect(handler.execute(createCommand('0123456789'))).rejects.toThrow(
      UnprocessableEntityException,
    );

    expect(update).not.toHaveBeenCalled();
    expect(outboxCreate).not.toHaveBeenCalled();
  });
});

import { describe, expect, it, jest } from '@jest/globals';
import { UnprocessableEntityException } from '@nestjs/common';
import { ISuppliersRepository } from '../../../domain/suppliers.repository';
import { Supplier } from '../../../domain/supplier.aggregate';
import { IUnitOfWork } from '../../../../../shared/application/unit-of-work';
import { CreateSupplierCommand } from './create-supplier.command';
import { CreateSupplierHandler } from './create-supplier.handler';

type NextSequence = () => Promise<number>;
type Save = (supplier: Supplier) => Promise<Supplier>;
type Run = (work: () => Promise<unknown>) => Promise<unknown>;

const createCommand = (phone: string | null = '0901234567') =>
  new CreateSupplierCommand(
    'Công ty TNHH ABC',
    phone,
    'contact@abc.vn',
    '12 Nguyễn Huệ',
    '0312345678',
  );

const setup = (sequence = 7) => {
  const nextSequence = jest.fn<NextSequence>(() => Promise.resolve(sequence));
  const save = jest.fn<Save>((supplier) => Promise.resolve(supplier));
  const run = jest.fn<Run>((work) => work());

  const repository: ISuppliersRepository = { nextSequence, save };
  const unitOfWork: IUnitOfWork = {
    run: run as unknown as IUnitOfWork['run'],
  };
  const handler = new CreateSupplierHandler(repository, unitOfWork);

  return { handler, nextSequence, save, run };
};

describe('CreateSupplierHandler', () => {
  it('creates a supplier inside a unit of work and saves it', async () => {
    const { handler, nextSequence, save, run } = setup(7);

    const result = await handler.execute(createCommand());

    expect(result.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(nextSequence).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledTimes(1);
    expect(run.mock.invocationCallOrder[0]).toBeLessThan(
      nextSequence.mock.invocationCallOrder[0],
    );

    const saved = save.mock.calls[0][0];

    expect(saved.getId()).toBe(result.id);
    expect(saved.getCode()).toBe('SUP-0007');
    expect(saved.getName()).toBe('Công ty TNHH ABC');
    expect(saved.getPhone()).toBe('0901234567');
    expect(saved.getEmail()).toBe('contact@abc.vn');
    expect(saved.getAddress()).toBe('12 Nguyễn Huệ');
    expect(saved.getTaxCode()).toBe('0312345678');
  });

  it('normalizes +84 phone numbers before saving', async () => {
    const { handler, save } = setup(8);

    await handler.execute(createCommand('+84901234567'));

    expect(save.mock.calls[0][0].getPhone()).toBe('0901234567');
  });

  it('does not save when the phone is invalid', async () => {
    const { handler, save } = setup();

    await expect(handler.execute(createCommand('0123456789'))).rejects.toThrow(
      UnprocessableEntityException,
    );

    expect(save).not.toHaveBeenCalled();
  });
});

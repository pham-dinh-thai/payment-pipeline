import { describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { CreateSupplierCommand } from '../../application/commands/create-supplier/create-supplier.command';
import { UpdateSupplierCommand } from '../../application/commands/update-supplier/update-supplier.command';
import { UpdateSupplierResponse } from '../../application/commands/update-supplier/update-supplier.response';
import { SuppliersController } from './suppliers.controller';

const SUPPLIER_ID = 'b3d7f2a8-7a0e-4f1c-9c1a-4d3f5e6a7b8c';

type Execute = (
  command: CreateSupplierCommand | UpdateSupplierCommand,
) => Promise<unknown>;

describe('SuppliersController', () => {
  let controller: SuppliersController;
  const execute = jest.fn<Execute>();

  beforeEach(async () => {
    execute.mockReset();
    execute.mockImplementation(() => Promise.resolve({ id: SUPPLIER_ID }));

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuppliersController],
      providers: [{ provide: CommandBus, useValue: { execute } }],
    }).compile();

    controller = module.get<SuppliersController>(SuppliersController);
  });

  it('dispatches CreateSupplierCommand and returns the new id', async () => {
    const result = await controller.create({
      name: 'Công ty TNHH ABC',
      phone: '0901234567',
      email: 'contact@abc.vn',
      address: '12 Nguyễn Huệ',
      taxCode: '0312345678',
    });

    expect(result).toEqual({ id: SUPPLIER_ID });
    expect(execute).toHaveBeenCalledTimes(1);

    const command = execute.mock.calls[0][0];

    expect(command).toBeInstanceOf(CreateSupplierCommand);
    expect(command.name).toBe('Công ty TNHH ABC');
    expect(command.phone).toBe('0901234567');
    expect(command.email).toBe('contact@abc.vn');
    expect(command.address).toBe('12 Nguyễn Huệ');
    expect(command.taxCode).toBe('0312345678');
  });

  it('maps missing optional fields to null', async () => {
    await controller.create({ name: 'Công ty TNHH ABC' });

    const command = execute.mock.calls[0][0];

    expect(command.phone).toBeNull();
    expect(command.email).toBeNull();
    expect(command.address).toBeNull();
    expect(command.taxCode).toBeNull();
  });

  it('dispatches UpdateSupplierCommand and returns the updated supplier', async () => {
    const response = new UpdateSupplierResponse(
      SUPPLIER_ID,
      'Công ty TNHH ABC (mới)',
      '02838223344',
      'new@abc.vn',
      '99 Lê Lợi',
      '0312345678',
    );
    execute.mockImplementation(() => Promise.resolve(response));

    const result = await controller.update(SUPPLIER_ID, {
      name: 'Công ty TNHH ABC (mới)',
      phone: '02838223344',
      email: 'new@abc.vn',
      address: '99 Lê Lợi',
      taxCode: '0312345678',
    });

    expect(result).toBe(response);
    expect(execute).toHaveBeenCalledTimes(1);

    const command = execute.mock.calls[0][0] as UpdateSupplierCommand;

    expect(command).toBeInstanceOf(UpdateSupplierCommand);
    expect(command.id).toBe(SUPPLIER_ID);
    expect(command.name).toBe('Công ty TNHH ABC (mới)');
    expect(command.phone).toBe('02838223344');
    expect(command.email).toBe('new@abc.vn');
    expect(command.address).toBe('99 Lê Lợi');
    expect(command.taxCode).toBe('0312345678');
  });

  it('maps missing optional fields to null on update', async () => {
    execute.mockImplementation(() =>
      Promise.resolve(
        new UpdateSupplierResponse(SUPPLIER_ID, 'ABC', null, null, null, null),
      ),
    );

    await controller.update(SUPPLIER_ID, { name: 'ABC' });

    const command = execute.mock.calls[0][0] as UpdateSupplierCommand;

    expect(command.id).toBe(SUPPLIER_ID);
    expect(command.phone).toBeNull();
    expect(command.email).toBeNull();
    expect(command.address).toBeNull();
    expect(command.taxCode).toBeNull();
  });
});

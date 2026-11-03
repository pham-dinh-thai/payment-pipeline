import { describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { CreateSupplierCommand } from '../../application/commands/create-supplier/create-supplier.command';
import { SuppliersController } from './suppliers.controller';

const SUPPLIER_ID = 'b3d7f2a8-7a0e-4f1c-9c1a-4d3f5e6a7b8c';

type Execute = (command: CreateSupplierCommand) => Promise<{ id: string }>;

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
});

import { jest } from '@jest/globals';
import { SuppliersController } from './suppliers.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { CreateSupplierCommand } from '../../application/commands/create-supplier/create-supplier.command';
import { CreateSupplierRequest } from './requests/create-supplier.request';
import { UpdateSupplierRequest } from './requests/update-supplier.request';
import { UpdateSupplierCommand } from '../../application/commands/update-supplier/update-supplier.command';
import { UpdateSupplierResponse } from '../../application/commands/update-supplier/update-supplier.response';
import { SupplierListItemReadModel } from '../../application/queries/get-suppliers/supplier-list-item.read-model';
import { SupplierStatus } from '../../domain/enums/supplier-status.enum';
import { GetSuppliersQuery } from '../../application/queries/get-suppliers/get-suppliers.query';
import { DeactivateSupplierCommand } from '../../application/commands/deactivate-supplier/deactivate-supplier.command';
import { ActivateSupplierCommand } from '../../application/commands/activate-supplier/activate-supplier.command';

const SUPPLIER_ID = 'b3d7f2a8-7a0e-4f1c-9c1a-4d3f5e6a7b8c';

describe('SuppliersController', () => {
  let suppliersController: SuppliersController;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    commandBus = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CommandBus>;

    queryBus = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<QueryBus>;

    const suppliersModule = await Test.createTestingModule({
      controllers: [SuppliersController],
      providers: [
        { provide: CommandBus, useValue: commandBus },
        { provide: QueryBus, useValue: queryBus },
      ],
    }).compile();

    suppliersController = suppliersModule.get(SuppliersController);
  });

  describe('findAll', () => {
    it('dispatches GetSuppliersQuery and returns the list', async () => {
      const response = [
        new SupplierListItemReadModel(
          SUPPLIER_ID,
          'SUP-0001',
          'Công ty TNHH ABC',
          SupplierStatus.ACTIVE,
          '0901234567',
          'contact@abc.vn',
          '12 Nguyễn Huệ',
          '0312345678',
          new Date('2026-01-01T00:00:00Z'),
          new Date('2026-01-01T00:00:00Z'),
        ),
      ];

      queryBus.execute.mockResolvedValue(response);

      const result = await suppliersController.findAll();

      expect(queryBus.execute).toHaveBeenCalledTimes(1);
      expect(queryBus.execute).toHaveBeenCalledWith(new GetSuppliersQuery());
      expect(result).toBe(response);
    });
  });

  describe('create', () => {
    it('dispatches CreateSupplierCommand with all request fields and returns the new id', async () => {
      const request = new CreateSupplierRequest();
      request.name = 'Công ty TNHH ABC';
      request.phone = '0901234567';
      request.email = 'contact@abc.vn';
      request.address = '12 Nguyễn Huệ';
      request.taxCode = '0312345678';

      commandBus.execute.mockResolvedValue({ id: SUPPLIER_ID });

      const result = await suppliersController.create(request);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new CreateSupplierCommand(
          request.name,
          request.phone,
          request.email,
          request.address,
          request.taxCode,
        ),
      );
      expect(commandBus.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ id: SUPPLIER_ID });
    });

    it('maps missing optional fields to null on create', async () => {
      const request = new CreateSupplierRequest();
      request.name = 'Công ty TNHH ABC';

      commandBus.execute.mockResolvedValue({ id: SUPPLIER_ID });

      const result = await suppliersController.create(request);

      expect(commandBus.execute).toHaveBeenCalledTimes(1);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new CreateSupplierCommand(request.name, null, null, null, null),
      );
      expect(result).toEqual({ id: SUPPLIER_ID });
    });
  });

  describe('update', () => {
    it('dispatches UpdateSupplierCommand and returns the updated supplier', async () => {
      const request = new UpdateSupplierRequest();
      request.name = 'Công ty TNHH ABC (mới)';
      request.phone = '02838223344';
      request.email = 'new@abc.vn';
      request.address = '99 Lê Lợi';
      request.taxCode = '0312345678';

      const response = new UpdateSupplierResponse(
        SUPPLIER_ID,
        request.name,
        request.phone,
        request.email,
        request.address,
        request.taxCode,
      );

      commandBus.execute.mockResolvedValue(response);

      const result = await suppliersController.update(SUPPLIER_ID, request);

      expect(commandBus.execute).toHaveBeenCalledTimes(1);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new UpdateSupplierCommand(
          SUPPLIER_ID,
          request.name,
          request.phone,
          request.email,
          request.address,
          request.taxCode,
        ),
      );
      expect(result).toBe(response);
    });

    it('maps missing optional fields to null on update', async () => {
      const request = new UpdateSupplierRequest();
      request.name = 'Công ty TNHH ABC (mới)';

      const response = new UpdateSupplierResponse(
        SUPPLIER_ID,
        request.name,
        null,
        null,
        null,
        null,
      );
      commandBus.execute.mockResolvedValue(response);

      const result = await suppliersController.update(SUPPLIER_ID, request);

      expect(commandBus.execute).toHaveBeenCalledTimes(1);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new UpdateSupplierCommand(
          SUPPLIER_ID,
          request.name,
          null,
          null,
          null,
          null,
        ),
      );
      expect(result).toBe(response);
    });
  });

  describe('deactivate', () => {
    it('dispatches DeactivateSupplierCommand and returns deactivated supplier', async () => {
      commandBus.execute.mockResolvedValue({ id: SUPPLIER_ID });

      const result = await suppliersController.deactivate(SUPPLIER_ID);

      expect(commandBus.execute).toHaveBeenCalledTimes(1);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new DeactivateSupplierCommand(SUPPLIER_ID),
      );
      expect(result).toEqual({ id: SUPPLIER_ID });
    });
  });

  describe('activate', () => {
    it('dispatches ActivateSupplierCommand and returns activated supplier', async () => {
      commandBus.execute.mockResolvedValue({ id: SUPPLIER_ID });

      const result = await suppliersController.activate(SUPPLIER_ID);

      expect(commandBus.execute).toHaveBeenCalledTimes(1);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new ActivateSupplierCommand(SUPPLIER_ID),
      );
      expect(result).toEqual({ id: SUPPLIER_ID });
    });
  });
});

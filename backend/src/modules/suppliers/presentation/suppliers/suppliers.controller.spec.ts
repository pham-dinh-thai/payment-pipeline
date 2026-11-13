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
import { AuthGuard } from '../../../../shared/modules/security/auth.guard';

const SUPPLIER_ID = 'b3d7f2a8-7a0e-4f1c-9c1a-4d3f5e6a7b8c';

const headers = {
  actorId: '7d0d2c55-9a9d-4c7d-9f6a-3f7f5a1b2c3d',
  actorType: 'user',
  actorLabel: 'admin@example.com',
  userIp: '127.0.0.1',
  userAgent: 'jest',
};

describe('SuppliersController', () => {
  let suppliersController: SuppliersController;
  let commandExecute: jest.Mock<(command: unknown) => Promise<unknown>>;
  let queryExecute: jest.Mock<(query: unknown) => Promise<unknown>>;

  beforeEach(async () => {
    commandExecute = jest.fn<(command: unknown) => Promise<unknown>>();
    queryExecute = jest.fn<(query: unknown) => Promise<unknown>>();

    const suppliersModule = await Test.createTestingModule({
      controllers: [SuppliersController],
      providers: [
        { provide: CommandBus, useValue: { execute: commandExecute } },
        { provide: QueryBus, useValue: { execute: queryExecute } },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

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

      queryExecute.mockResolvedValue(response);

      const result = await suppliersController.findAll();

      expect(queryExecute).toHaveBeenCalledTimes(1);
      expect(queryExecute).toHaveBeenCalledWith(new GetSuppliersQuery());
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

      commandExecute.mockResolvedValue({ id: SUPPLIER_ID });

      const result = await suppliersController.create(request, headers);

      expect(commandExecute).toHaveBeenCalledWith(
        new CreateSupplierCommand(
          request.name,
          request.phone,
          request.email,
          request.address,
          request.taxCode,
          headers,
        ),
      );
      expect(commandExecute).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ id: SUPPLIER_ID });
    });

    it('maps missing optional fields to null on create', async () => {
      const request = new CreateSupplierRequest();
      request.name = 'Công ty TNHH ABC';

      commandExecute.mockResolvedValue({ id: SUPPLIER_ID });

      const result = await suppliersController.create(request, headers);

      expect(commandExecute).toHaveBeenCalledTimes(1);
      expect(commandExecute).toHaveBeenCalledWith(
        new CreateSupplierCommand(
          request.name,
          null,
          null,
          null,
          null,
          headers,
        ),
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

      commandExecute.mockResolvedValue(response);

      const result = await suppliersController.update(
        SUPPLIER_ID,
        request,
        headers,
      );

      expect(commandExecute).toHaveBeenCalledTimes(1);
      expect(commandExecute).toHaveBeenCalledWith(
        new UpdateSupplierCommand(
          SUPPLIER_ID,
          request.name,
          request.phone,
          request.email,
          request.address,
          request.taxCode,
          headers,
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
      commandExecute.mockResolvedValue(response);

      const result = await suppliersController.update(
        SUPPLIER_ID,
        request,
        headers,
      );

      expect(commandExecute).toHaveBeenCalledTimes(1);
      expect(commandExecute).toHaveBeenCalledWith(
        new UpdateSupplierCommand(
          SUPPLIER_ID,
          request.name,
          null,
          null,
          null,
          null,
          headers,
        ),
      );
      expect(result).toBe(response);
    });
  });

  describe('deactivate', () => {
    it('dispatches DeactivateSupplierCommand and returns deactivated supplier', async () => {
      commandExecute.mockResolvedValue({ id: SUPPLIER_ID });

      const result = await suppliersController.deactivate(SUPPLIER_ID, headers);

      expect(commandExecute).toHaveBeenCalledTimes(1);
      expect(commandExecute).toHaveBeenCalledWith(
        new DeactivateSupplierCommand(SUPPLIER_ID, headers),
      );
      expect(result).toEqual({ id: SUPPLIER_ID });
    });
  });

  describe('activate', () => {
    it('dispatches ActivateSupplierCommand and returns activated supplier', async () => {
      commandExecute.mockResolvedValue({ id: SUPPLIER_ID });

      const result = await suppliersController.activate(SUPPLIER_ID, headers);

      expect(commandExecute).toHaveBeenCalledTimes(1);
      expect(commandExecute).toHaveBeenCalledWith(
        new ActivateSupplierCommand(SUPPLIER_ID, headers),
      );
      expect(result).toEqual({ id: SUPPLIER_ID });
    });
  });
});

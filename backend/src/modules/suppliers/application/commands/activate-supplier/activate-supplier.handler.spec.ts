import { jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { ActivateSupplierHandler } from './activate-supplier.handler';
import {
  ISuppliersRepository,
  SUPPLIERS_REPOSITORY,
} from '../../../domain/suppliers.repository';
import {
  IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/modules/unit-of-work/unit-of-work';
import { ActivateSupplierCommand } from './activate-supplier.command';
import { NotFoundException } from '@nestjs/common';
import { Supplier } from '../../../domain/supplier.aggregate';

describe('ActivateSupplierHandler', () => {
  let activateSupplierHandler: ActivateSupplierHandler;
  let suppliersRepository: jest.Mocked<
    Pick<ISuppliersRepository, 'findById' | 'update'>
  >;
  let unitOfWork: jest.Mocked<IUnitOfWork>;

  beforeEach(async () => {
    suppliersRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    unitOfWork = {
      run: jest.fn(async (callback: () => any) => callback()),
    } as unknown as jest.Mocked<IUnitOfWork>;

    const suppliersModule = await Test.createTestingModule({
      providers: [
        { provide: SUPPLIERS_REPOSITORY, useValue: suppliersRepository },
        { provide: UNIT_OF_WORK, useValue: unitOfWork },
        ActivateSupplierHandler,
      ],
    }).compile();

    activateSupplierHandler = suppliersModule.get(ActivateSupplierHandler);
  });

  describe('execute', () => {
    it('Throws NotFoundException when supplier not found', async () => {
      const id = '4e770b20-0ab6-494a-9bfd-e475e07c7a17';

      suppliersRepository.findById.mockResolvedValue(null);

      await expect(
        activateSupplierHandler.execute(new ActivateSupplierCommand(id)),
      ).rejects.toThrow(NotFoundException);

      expect(suppliersRepository.update).not.toHaveBeenCalled();
    });

    it('Activated supplier and returns id when found', async () => {
      const id = '4e770b20-0ab6-494a-9bfd-e475e07c7a17';

      const supplier = {
        activate: jest.fn(),
        getId: jest.fn().mockReturnValue(id),
      };

      suppliersRepository.findById.mockResolvedValue(
        supplier as unknown as Supplier,
      );

      const result = await activateSupplierHandler.execute(
        new ActivateSupplierCommand(id),
      );

      expect(suppliersRepository.findById).toHaveBeenCalledWith(id);
      expect(supplier.activate).toHaveBeenCalledTimes(1);
      expect(suppliersRepository.update).toHaveBeenCalledWith(supplier);
      expect(result).toEqual({ id });
    });
  });
});

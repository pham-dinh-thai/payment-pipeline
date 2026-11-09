import { Test } from '@nestjs/testing';
import {
  IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/modules/unit-of-work/unit-of-work';
import {
  ISuppliersRepository,
  SUPPLIERS_REPOSITORY,
} from '../../../domain/suppliers.repository';
import { DeactivateSupplierHandler } from './deactivate-supplier.handler';
import { jest } from '@jest/globals';
import { DeactivateSupplierCommand } from './deactivate-supplier.command';
import { NotFoundException } from '@nestjs/common';
import { Supplier } from '../../../domain/supplier.aggregate';

describe('DeactivateSupplierHandler', () => {
  let deactivateSupplierHandler: DeactivateSupplierHandler;
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
      run: jest.fn((work: () => Promise<any>) => work()),
    };

    const suppliersModule = await Test.createTestingModule({
      providers: [
        DeactivateSupplierHandler,
        { provide: SUPPLIERS_REPOSITORY, useValue: suppliersRepository },
        { provide: UNIT_OF_WORK, useValue: unitOfWork },
      ],
    }).compile();

    deactivateSupplierHandler = suppliersModule.get(DeactivateSupplierHandler);
  });

  describe('execute', () => {
    it('Throws NotFoundException when supplier not found', async () => {
      const id = '4e770b20-0ab6-494a-9bfd-e475e07c7a17';

      suppliersRepository.findById.mockResolvedValue(null);

      await expect(
        deactivateSupplierHandler.execute(new DeactivateSupplierCommand(id)),
      ).rejects.toThrow(NotFoundException);

      expect(suppliersRepository.update).toHaveBeenCalledTimes(0);
    });

    it('Deactivated supplier and returns id when found', async () => {
      const id = '4e770b20-0ab6-494a-9bfd-e475e07c7a17';

      const supplier = {
        deactivate: jest.fn(),
        getId: jest.fn().mockReturnValue(id),
      };

      suppliersRepository.findById.mockResolvedValue(
        supplier as unknown as Supplier,
      );

      const result = await deactivateSupplierHandler.execute(
        new DeactivateSupplierCommand(id),
      );

      expect(suppliersRepository.findById).toHaveBeenCalledWith(id);
      expect(supplier.deactivate).toHaveBeenCalledTimes(1);
      expect(suppliersRepository.update).toHaveBeenCalledWith(supplier);
      expect(suppliersRepository.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ id });
    });
  });
});

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
import {
  IOutboxRepository,
  OUTBOX_REPOSITORY,
} from '../../../../../shared/modules/outbox/domain/outbox.repository';
import { ActivateSupplierCommand } from './activate-supplier.command';
import { NotFoundException } from '@nestjs/common';
import { Supplier } from '../../../domain/supplier.aggregate';
import { SupplierStatus } from '../../../domain/enums/supplier-status.enum';
import { SUPPLIER_ACTIVATED_EVENT } from '../../../domain/events/supplier-activated.event';
import { EntityType } from '../../../../audit-logs/domain/enums/entity-type.enum';

const SUPPLIER_ID = '4e770b20-0ab6-494a-9bfd-e475e07c7a17';

const headers = {
  actorId: '7d0d2c55-9a9d-4c7d-9f6a-3f7f5a1b2c3d',
  actorType: 'user',
  actorLabel: 'admin@example.com',
  userIp: '127.0.0.1',
  userAgent: 'jest',
};

const createSupplier = () =>
  Supplier.fromPersistent({
    id: SUPPLIER_ID,
    code: 'SUP-0007',
    name: 'Công ty TNHH ABC',
    status: SupplierStatus.INACTIVE,
    phone: '0901234567',
    email: 'contact@abc.vn',
    address: '12 Nguyễn Huệ',
    taxCode: '0312345678',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  });

describe('ActivateSupplierHandler', () => {
  let activateSupplierHandler: ActivateSupplierHandler;
  let suppliersRepository: jest.Mocked<
    Pick<ISuppliersRepository, 'findById' | 'update'>
  >;
  let outboxRepository: jest.Mocked<Pick<IOutboxRepository, 'create'>>;
  let unitOfWork: jest.Mocked<IUnitOfWork>;

  beforeEach(async () => {
    suppliersRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<
      Pick<ISuppliersRepository, 'findById' | 'update'>
    >;

    outboxRepository = {
      create: jest.fn(),
    } as unknown as jest.Mocked<Pick<IOutboxRepository, 'create'>>;

    unitOfWork = {
      run: jest.fn((callback: () => unknown) => callback()),
    } as unknown as jest.Mocked<IUnitOfWork>;

    const suppliersModule = await Test.createTestingModule({
      providers: [
        { provide: SUPPLIERS_REPOSITORY, useValue: suppliersRepository },
        { provide: OUTBOX_REPOSITORY, useValue: outboxRepository },
        { provide: UNIT_OF_WORK, useValue: unitOfWork },
        ActivateSupplierHandler,
      ],
    }).compile();

    activateSupplierHandler = suppliersModule.get(ActivateSupplierHandler);
  });

  describe('execute', () => {
    it('Throws NotFoundException when supplier not found', async () => {
      suppliersRepository.findById.mockResolvedValue(null);

      await expect(
        activateSupplierHandler.execute(
          new ActivateSupplierCommand(SUPPLIER_ID, headers),
        ),
      ).rejects.toThrow(NotFoundException);

      expect(suppliersRepository.update).not.toHaveBeenCalled();
      expect(outboxRepository.create).not.toHaveBeenCalled();
    });

    it('Activates supplier and appends an audit event', async () => {
      const supplier = createSupplier();
      suppliersRepository.findById.mockResolvedValue(supplier);
      suppliersRepository.update.mockResolvedValue(supplier);

      const result = await activateSupplierHandler.execute(
        new ActivateSupplierCommand(SUPPLIER_ID, headers),
      );

      expect(suppliersRepository.findById).toHaveBeenCalledWith(SUPPLIER_ID);
      expect(supplier.isActive()).toBe(true);
      expect(suppliersRepository.update).toHaveBeenCalledWith(supplier);
      expect(result).toEqual({ id: SUPPLIER_ID });

      expect(outboxRepository.create).toHaveBeenCalledWith({
        eventType: SUPPLIER_ACTIVATED_EVENT,
        payload: {
          headers,
          audit: {
            entityType: EntityType.SUPPLIERS,
            entityId: SUPPLIER_ID,
            before: { status: SupplierStatus.INACTIVE },
            after: { status: SupplierStatus.ACTIVE },
          },
        },
      });
    });
  });
});

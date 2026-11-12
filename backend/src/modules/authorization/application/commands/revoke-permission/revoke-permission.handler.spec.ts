import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { RevokePermissionHandler } from './revoke-permission.handler';
import { RevokePermissionCommand } from './revoke-permission.command';
import {
  type IRolesRepository,
  ROLES_REPOSITORY,
} from '../../../domain/roles.repository';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/modules/unit-of-work/unit-of-work';
import {
  type IOutboxRepository,
  OUTBOX_REPOSITORY,
} from '../../../../../shared/modules/outbox/domain/outbox.repository';
import { Role } from '../../../domain/role.aggregate';

const headers = {
  actorId: '7d0d2c55-9a9d-4c7d-9f6a-3f7f5a1b2c3d',
  actorType: 'user',
  actorLabel: 'admin@example.com',
  userIp: '127.0.0.1',
  userAgent: 'jest',
};

describe('RevokePermissionHandler', () => {
  let handler: RevokePermissionHandler;
  let rolesRepository: jest.Mocked<
    Pick<IRolesRepository, 'findById' | 'update'>
  >;
  let outboxRepository: jest.Mocked<Pick<IOutboxRepository, 'create'>>;
  let unitOfWork: jest.Mocked<IUnitOfWork>;

  const id = '4e770b20-0ab6-494a-9bfd-e475e07c7a17';

  beforeEach(async () => {
    rolesRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<Pick<IRolesRepository, 'findById' | 'update'>>;

    outboxRepository = {
      create: jest.fn(),
    } as unknown as jest.Mocked<Pick<IOutboxRepository, 'create'>>;

    unitOfWork = {
      run: jest.fn(async (callback: () => Promise<unknown>) => callback()),
    } as unknown as jest.Mocked<IUnitOfWork>;

    const moduleRef = await Test.createTestingModule({
      providers: [
        { provide: ROLES_REPOSITORY, useValue: rolesRepository },
        { provide: OUTBOX_REPOSITORY, useValue: outboxRepository },
        { provide: UNIT_OF_WORK, useValue: unitOfWork },
        RevokePermissionHandler,
      ],
    }).compile();

    handler = moduleRef.get(RevokePermissionHandler);
  });

  it('throws NotFoundException when role does not exist', async () => {
    rolesRepository.findById.mockResolvedValue(null);

    await expect(
      handler.execute(
        new RevokePermissionCommand(id, 'orders:process', headers),
      ),
    ).rejects.toThrow(NotFoundException);

    expect(rolesRepository.update).not.toHaveBeenCalled();
    expect(outboxRepository.create).not.toHaveBeenCalled();
  });

  it('revokes the permission, persists the role and appends an event', async () => {
    const revoke = jest.fn();
    const createdAt = new Date('2026-11-11T00:00:00.000Z');
    const role = {
      getId: () => id,
      getName: () => 'manager',
      getPermissions: () => [],
      getIsSuperAdmin: () => false,
      getCreatedAt: () => createdAt,
      revoke,
    } as unknown as Role;

    rolesRepository.findById.mockResolvedValue(role);

    const result = await handler.execute(
      new RevokePermissionCommand(id, 'orders:process', headers),
    );

    expect(revoke).toHaveBeenCalledWith('orders:process');
    expect(rolesRepository.update).toHaveBeenCalledWith(role);
    expect(outboxRepository.create.mock.calls).toEqual([
      [
        {
          eventType: 'role.revoked',
          payload: {
            headers,
            role: {
              id,
              name: 'manager',
              permissions: [],
              isSuperAdmin: false,
              createdAt: createdAt.toISOString(),
            },
          },
        },
      ],
    ]);
    expect(result).toEqual({ id });
  });
});

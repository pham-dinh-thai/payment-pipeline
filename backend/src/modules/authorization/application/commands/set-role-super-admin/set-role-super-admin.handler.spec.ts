import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SetRoleSuperAdminHandler } from './set-role-super-admin.handler';
import { SetRoleSuperAdminCommand } from './set-role-super-admin.command';
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
import { EntityType } from '../../../../audit-logs/domain/enums/entity-type.enum';

const headers = {
  actorId: '7d0d2c55-9a9d-4c7d-9f6a-3f7f5a1b2c3d',
  actorType: 'user',
  actorLabel: 'admin@example.com',
  userIp: '127.0.0.1',
  userAgent: 'jest',
};

const createdAt = new Date('2026-11-11T00:00:00.000Z');

describe('SetRoleSuperAdminHandler', () => {
  let handler: SetRoleSuperAdminHandler;
  let rolesRepository: jest.Mocked<
    Pick<IRolesRepository, 'findById' | 'update'>
  >;
  let outboxRepository: jest.Mocked<Pick<IOutboxRepository, 'create'>>;
  let unitOfWork: jest.Mocked<IUnitOfWork>;

  const id = '4e770b20-0ab6-494a-9bfd-e475e07c7a17';

  const roleWith = (isSuperAdmin: boolean) => {
    let current = isSuperAdmin;
    const promoteToSuperAdmin = jest.fn(() => {
      current = true;
    });
    const demoteFromSuperAdmin = jest.fn(() => {
      current = false;
    });
    const role = {
      getId: () => id,
      getName: () => 'admin',
      getPermissions: () => [],
      getIsSuperAdmin: () => current,
      getCreatedAt: () => createdAt,
      promoteToSuperAdmin,
      demoteFromSuperAdmin,
    } as unknown as Role;

    return { role, promoteToSuperAdmin, demoteFromSuperAdmin };
  };

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
        SetRoleSuperAdminHandler,
      ],
    }).compile();

    handler = moduleRef.get(SetRoleSuperAdminHandler);
  });

  it('throws NotFoundException when role does not exist', async () => {
    rolesRepository.findById.mockResolvedValue(null);

    await expect(
      handler.execute(new SetRoleSuperAdminCommand(id, true, headers)),
    ).rejects.toThrow(NotFoundException);

    expect(rolesRepository.update).not.toHaveBeenCalled();
    expect(outboxRepository.create).not.toHaveBeenCalled();
  });

  it('promotes the role and appends an event', async () => {
    const { role, promoteToSuperAdmin, demoteFromSuperAdmin } = roleWith(false);
    rolesRepository.findById.mockResolvedValue(role);

    const result = await handler.execute(
      new SetRoleSuperAdminCommand(id, true, headers),
    );

    expect(promoteToSuperAdmin).toHaveBeenCalledTimes(1);
    expect(demoteFromSuperAdmin).not.toHaveBeenCalled();
    expect(rolesRepository.update).toHaveBeenCalledWith(role);
    expect(outboxRepository.create.mock.calls).toEqual([
      [
        {
          eventType: 'role.super_admin_set',
          payload: {
            headers,
            audit: {
              entityType: EntityType.ROLES,
              entityId: id,
              before: { isSuperAdmin: false },
              after: { isSuperAdmin: true },
            },
          },
        },
      ],
    ]);
    expect(result).toEqual({ id });
  });

  it('demotes the role and appends an event', async () => {
    const { role, promoteToSuperAdmin, demoteFromSuperAdmin } = roleWith(true);
    rolesRepository.findById.mockResolvedValue(role);

    await handler.execute(new SetRoleSuperAdminCommand(id, false, headers));

    expect(demoteFromSuperAdmin).toHaveBeenCalledTimes(1);
    expect(promoteToSuperAdmin).not.toHaveBeenCalled();
    expect(outboxRepository.create.mock.calls).toEqual([
      [
        {
          eventType: 'role.super_admin_set',
          payload: {
            headers,
            audit: {
              entityType: EntityType.ROLES,
              entityId: id,
              before: { isSuperAdmin: true },
              after: { isSuperAdmin: false },
            },
          },
        },
      ],
    ]);
  });
});

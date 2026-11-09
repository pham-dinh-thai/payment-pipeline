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
import { Role } from '../../../domain/role.aggregate';

describe('RevokePermissionHandler', () => {
  let handler: RevokePermissionHandler;
  let rolesRepository: jest.Mocked<
    Pick<IRolesRepository, 'findById' | 'update'>
  >;
  let unitOfWork: jest.Mocked<IUnitOfWork>;

  const id = '4e770b20-0ab6-494a-9bfd-e475e07c7a17';

  beforeEach(async () => {
    rolesRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<Pick<IRolesRepository, 'findById' | 'update'>>;

    unitOfWork = {
      run: jest.fn(async (callback: () => Promise<unknown>) => callback()),
    } as unknown as jest.Mocked<IUnitOfWork>;

    const moduleRef = await Test.createTestingModule({
      providers: [
        { provide: ROLES_REPOSITORY, useValue: rolesRepository },
        { provide: UNIT_OF_WORK, useValue: unitOfWork },
        RevokePermissionHandler,
      ],
    }).compile();

    handler = moduleRef.get(RevokePermissionHandler);
  });

  it('throws NotFoundException when role does not exist', async () => {
    rolesRepository.findById.mockResolvedValue(null);

    await expect(
      handler.execute(new RevokePermissionCommand(id, 'orders:process')),
    ).rejects.toThrow(NotFoundException);

    expect(rolesRepository.update).not.toHaveBeenCalled();
  });

  it('revokes the permission and persists the role', async () => {
    const role = {
      getId: jest.fn().mockReturnValue(id),
      revoke: jest.fn(),
    } as unknown as Role;

    rolesRepository.findById.mockResolvedValue(role);

    const result = await handler.execute(
      new RevokePermissionCommand(id, 'orders:process'),
    );

    expect(role.revoke).toHaveBeenCalledWith('orders:process');
    expect(rolesRepository.update).toHaveBeenCalledWith(role);
    expect(result).toEqual({ id });
  });
});

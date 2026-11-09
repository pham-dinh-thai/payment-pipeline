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
import { Role } from '../../../domain/role.aggregate';

describe('SetRoleSuperAdminHandler', () => {
  let handler: SetRoleSuperAdminHandler;
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
        SetRoleSuperAdminHandler,
      ],
    }).compile();

    handler = moduleRef.get(SetRoleSuperAdminHandler);
  });

  it('throws NotFoundException when role does not exist', async () => {
    rolesRepository.findById.mockResolvedValue(null);

    await expect(
      handler.execute(new SetRoleSuperAdminCommand(id, true)),
    ).rejects.toThrow(NotFoundException);

    expect(rolesRepository.update).not.toHaveBeenCalled();
  });

  it('promotes the role when isSuperAdmin is true', async () => {
    const role = {
      getId: jest.fn().mockReturnValue(id),
      promoteToSuperAdmin: jest.fn(),
      demoteFromSuperAdmin: jest.fn(),
    } as unknown as Role;

    rolesRepository.findById.mockResolvedValue(role);

    const result = await handler.execute(
      new SetRoleSuperAdminCommand(id, true),
    );

    expect(role.promoteToSuperAdmin).toHaveBeenCalledTimes(1);
    expect(role.demoteFromSuperAdmin).not.toHaveBeenCalled();
    expect(rolesRepository.update).toHaveBeenCalledWith(role);
    expect(result).toEqual({ id });
  });

  it('demotes the role when isSuperAdmin is false', async () => {
    const role = {
      getId: jest.fn().mockReturnValue(id),
      promoteToSuperAdmin: jest.fn(),
      demoteFromSuperAdmin: jest.fn(),
    } as unknown as Role;

    rolesRepository.findById.mockResolvedValue(role);

    await handler.execute(new SetRoleSuperAdminCommand(id, false));

    expect(role.demoteFromSuperAdmin).toHaveBeenCalledTimes(1);
    expect(role.promoteToSuperAdmin).not.toHaveBeenCalled();
  });
});

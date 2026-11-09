import { jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { CreateRoleHandler } from './create-role.handler';
import { CreateRoleCommand } from './create-role.command';
import {
  type IRolesRepository,
  ROLES_REPOSITORY,
} from '../../../domain/roles.repository';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/modules/unit-of-work/unit-of-work';

describe('CreateRoleHandler', () => {
  let handler: CreateRoleHandler;
  let rolesRepository: jest.Mocked<Pick<IRolesRepository, 'create'>>;
  let unitOfWork: jest.Mocked<IUnitOfWork>;

  beforeEach(async () => {
    rolesRepository = {
      create: jest.fn(),
    } as unknown as jest.Mocked<Pick<IRolesRepository, 'create'>>;

    unitOfWork = {
      run: jest.fn(async (callback: () => Promise<unknown>) => callback()),
    } as unknown as jest.Mocked<IUnitOfWork>;

    const moduleRef = await Test.createTestingModule({
      providers: [
        { provide: ROLES_REPOSITORY, useValue: rolesRepository },
        { provide: UNIT_OF_WORK, useValue: unitOfWork },
        CreateRoleHandler,
      ],
    }).compile();

    handler = moduleRef.get(CreateRoleHandler);
  });

  it('creates a role and returns its id', async () => {
    const result = await handler.execute(
      new CreateRoleCommand('manager', ['orders:read'], false),
    );

    expect(rolesRepository.create).toHaveBeenCalledTimes(1);

    const role = rolesRepository.create.mock.calls[0][0];

    expect(role.getName()).toBe('manager');
    expect(role.getPermissions()).toEqual(['orders:read']);
    expect(role.getIsSuperAdmin()).toBe(false);
    expect(result).toEqual({ id: role.getId() });
  });
});

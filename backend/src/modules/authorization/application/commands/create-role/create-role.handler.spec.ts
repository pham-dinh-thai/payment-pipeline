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
import {
  type IOutboxRepository,
  OUTBOX_REPOSITORY,
} from '../../../../../shared/modules/outbox/domain/outbox.repository';

const headers = {
  actorId: '7d0d2c55-9a9d-4c7d-9f6a-3f7f5a1b2c3d',
  actorType: 'user',
  actorLabel: 'admin@example.com',
  userIp: '127.0.0.1',
  userAgent: 'jest',
};

describe('CreateRoleHandler', () => {
  let handler: CreateRoleHandler;
  let rolesRepository: jest.Mocked<Pick<IRolesRepository, 'create'>>;
  let outboxRepository: jest.Mocked<Pick<IOutboxRepository, 'create'>>;
  let unitOfWork: jest.Mocked<IUnitOfWork>;

  beforeEach(async () => {
    rolesRepository = {
      create: jest.fn(),
    } as unknown as jest.Mocked<Pick<IRolesRepository, 'create'>>;

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
        CreateRoleHandler,
      ],
    }).compile();

    handler = moduleRef.get(CreateRoleHandler);
  });

  it('creates a role and returns its id', async () => {
    const result = await handler.execute(
      new CreateRoleCommand('manager', ['orders:read'], false, headers),
    );

    expect(rolesRepository.create).toHaveBeenCalledTimes(1);

    const role = rolesRepository.create.mock.calls[0][0];

    expect(role.getName()).toBe('manager');
    expect(role.getPermissions()).toEqual(['orders:read']);
    expect(role.getIsSuperAdmin()).toBe(false);
    expect(result).toEqual({ id: role.getId() });
  });

  it('appends a role.created event inside the same unit of work', async () => {
    await handler.execute(
      new CreateRoleCommand('manager', ['orders:read'], false, headers),
    );

    const role = rolesRepository.create.mock.calls[0][0];
    const [createCall] = outboxRepository.create.mock.calls;

    expect(createCall).toEqual([
      {
        eventType: 'role.created',
        payload: {
          headers,
          role: {
            id: role.getId(),
            name: 'manager',
            permissions: ['orders:read'],
            isSuperAdmin: false,
            createdAt: role.getCreatedAt().toISOString(),
          },
        },
      },
    ]);
    expect(unitOfWork.run.mock.calls).toHaveLength(1);
  });

  it('does not append the event when the role write fails', async () => {
    rolesRepository.create.mockRejectedValue(new Error('write failed'));

    await expect(
      handler.execute(
        new CreateRoleCommand('manager', ['orders:read'], false, headers),
      ),
    ).rejects.toThrow('write failed');

    expect(outboxRepository.create.mock.calls).toHaveLength(0);
  });
});

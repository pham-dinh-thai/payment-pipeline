import { jest } from '@jest/globals';
import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CreateUserByAdminHandler } from './create-user-by-admin.handler';
import { CreateUserByAdminCommand } from './create-user-by-admin.command';
import { CreateUserService } from '../../services/create-user.service';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/modules/unit-of-work/unit-of-work';
import {
  type IOutboxRepository,
  OUTBOX_REPOSITORY,
} from '../../../../../shared/modules/outbox/domain/outbox.repository';
import { User } from '../../../domain/user.aggregate';
import { USER_CREATED_EVENT } from '../../../domain/events/user-created.event';
import { EntityType } from '../../../../audit-logs/domain/enums/entity-type.enum';

const headers = {
  actorId: '7d0d2c55-9a9d-4c7d-9f6a-3f7f5a1b2c3d',
  actorType: 'user',
  actorLabel: 'admin@example.com',
  userIp: '127.0.0.1',
  userAgent: 'jest',
};

describe('CreateUserByAdminHandler', () => {
  let handler: CreateUserByAdminHandler;
  let createUserService: jest.Mocked<Pick<CreateUserService, 'create'>>;
  let outboxRepository: jest.Mocked<Pick<IOutboxRepository, 'create'>>;
  let unitOfWork: jest.Mocked<IUnitOfWork>;

  beforeEach(async () => {
    createUserService = {
      create: jest.fn(),
    } as unknown as jest.Mocked<Pick<CreateUserService, 'create'>>;

    outboxRepository = {
      create: jest.fn(),
    } as unknown as jest.Mocked<Pick<IOutboxRepository, 'create'>>;

    unitOfWork = {
      run: jest.fn(async (callback: () => Promise<unknown>) => callback()),
    } as unknown as jest.Mocked<IUnitOfWork>;

    const moduleRef = await Test.createTestingModule({
      providers: [
        { provide: CreateUserService, useValue: createUserService },
        { provide: OUTBOX_REPOSITORY, useValue: outboxRepository },
        { provide: UNIT_OF_WORK, useValue: unitOfWork },
        CreateUserByAdminHandler,
      ],
    }).compile();

    handler = moduleRef.get(CreateUserByAdminHandler);
  });

  it('creates the user and appends an audit event', async () => {
    const user = User.create({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
    });
    createUserService.create.mockResolvedValue(user);

    const result = await handler.execute(
      new CreateUserByAdminCommand('Jane', 'Doe', 'jane@example.com', headers),
    );

    expect(createUserService.create).toHaveBeenCalledWith({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
    });
    expect(outboxRepository.create).toHaveBeenCalledWith({
      eventType: USER_CREATED_EVENT,
      payload: {
        headers,
        audit: {
          entityType: EntityType.USERS,
          entityId: user.getId(),
          after: {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@example.com',
            roleIds: [],
          },
        },
      },
    });
    expect(result).toEqual({ id: user.getId() });
  });

  it('does not append an event when creation is rejected', async () => {
    createUserService.create.mockRejectedValue(
      new ConflictException('User email jane@example.com already exists'),
    );

    await expect(
      handler.execute(
        new CreateUserByAdminCommand(
          'Jane',
          'Doe',
          'jane@example.com',
          headers,
        ),
      ),
    ).rejects.toThrow(ConflictException);

    expect(outboxRepository.create).not.toHaveBeenCalled();
  });
});

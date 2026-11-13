import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { AuthGuard } from '../../../../shared/modules/security/auth.guard';
import { PermissionsGuard } from '../../../../shared/modules/security/permissions.guard';
import { CreateUserByAdminCommand } from '../../application/commands/create-user-by-admin/create-user-by-admin.command';
import { UsersController } from './users.controller';

const headers = {
  actorId: '7d0d2c55-9a9d-4c7d-9f6a-3f7f5a1b2c3d',
  actorType: 'user',
  actorLabel: 'admin@example.com',
  userIp: '127.0.0.1',
  userAgent: 'jest',
};

describe('UsersController', () => {
  let controller: UsersController;
  let execute: jest.Mock<(command: unknown) => Promise<unknown>>;

  beforeEach(async () => {
    execute = jest.fn<(command: unknown) => Promise<unknown>>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: CommandBus,
          useValue: { execute },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('dispatches CreateUserByAdminCommand with actor headers', async () => {
    execute.mockResolvedValue({ id: 'user-1' });

    const result = await controller.create(
      { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
      headers,
    );

    expect(execute).toHaveBeenCalledWith(
      new CreateUserByAdminCommand('Jane', 'Doe', 'jane@example.com', headers),
    );
    expect(result).toEqual({ id: 'user-1' });
  });
});

import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { RemoveRoleHandler } from './remove-role.handler';
import { RemoveRoleCommand } from './remove-role.command';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from '../../../domain/users.repository';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/modules/unit-of-work/unit-of-work';
import { User } from '../../../domain/user.aggregate';

describe('RemoveRoleHandler', () => {
  let handler: RemoveRoleHandler;
  let usersRepository: jest.Mocked<
    Pick<IUsersRepository, 'findById' | 'update'>
  >;
  let unitOfWork: jest.Mocked<IUnitOfWork>;

  const userId = '4e770b20-0ab6-494a-9bfd-e475e07c7a17';
  const roleId = '1c2e9d5b-2c3a-4d6e-9f8a-0b1c2d3e4f50';

  beforeEach(async () => {
    usersRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<Pick<IUsersRepository, 'findById' | 'update'>>;

    unitOfWork = {
      run: jest.fn(async (callback: () => Promise<unknown>) => callback()),
    } as unknown as jest.Mocked<IUnitOfWork>;

    const moduleRef = await Test.createTestingModule({
      providers: [
        { provide: USERS_REPOSITORY, useValue: usersRepository },
        { provide: UNIT_OF_WORK, useValue: unitOfWork },
        RemoveRoleHandler,
      ],
    }).compile();

    handler = moduleRef.get(RemoveRoleHandler);
  });

  it('throws NotFoundException when user does not exist', async () => {
    usersRepository.findById.mockResolvedValue(null);

    await expect(
      handler.execute(new RemoveRoleCommand(userId, roleId)),
    ).rejects.toThrow(NotFoundException);

    expect(usersRepository.update).not.toHaveBeenCalled();
  });

  it('removes the role and persists the user', async () => {
    const user = User.create({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      roleIds: [roleId],
    });

    usersRepository.findById.mockResolvedValue(user);

    const result = await handler.execute(new RemoveRoleCommand(userId, roleId));

    expect(user.getRoleIds()).toEqual([]);
    expect(usersRepository.update).toHaveBeenCalledWith(user);
    expect(result).toEqual({ id: user.getId(), roleIds: [] });
  });
});

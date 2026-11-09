import { describe, expect, it, jest } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import {
  AuditLogPage,
  FindAuditLogsOptions,
  IAuditLogsRepository,
} from '../../../domain/audit-logs.repository';
import { ActorType } from '../../../domain/enums/actor-type.enum';
import { AuditStatus } from '../../../domain/enums/audit-status.enum';
import { EntityType } from '../../../domain/enums/entity-type.enum';
import { ListAuditLogsHandler } from './list-audit-logs.handler';
import { ListAuditLogsQuery } from './list-audit-logs.query';

type FindPage = (options: FindAuditLogsOptions) => Promise<AuditLogPage>;

const setup = () => {
  const findPage = jest.fn<FindPage>(() =>
    Promise.resolve({ items: [], total: 0 }),
  );
  const repository = {
    findById: jest.fn(),
    findByEntity: jest.fn(),
    findPage,
    create: jest.fn(),
  } as unknown as IAuditLogsRepository;
  const handler = new ListAuditLogsHandler(repository);

  return { handler, findPage };
};

describe('ListAuditLogsHandler', () => {
  it('passes filters and pagination to the repository', async () => {
    const { handler, findPage } = setup();
    const from = new Date('2026-01-01T00:00:00.000Z');
    const to = new Date('2026-01-31T23:59:59.000Z');

    const result = await handler.execute(
      new ListAuditLogsQuery({
        actorId: '47772e7a-6dd4-4d56-846b-18bd693f46ca',
        actorType: ActorType.USER,
        action: 'role.grant_permission',
        entityType: EntityType.ROLES,
        entityId: '4e770b20-0ab6-494a-9bfd-e475e07c7a17',
        status: AuditStatus.FAILED,
        from,
        to,
        page: 3,
        limit: 10,
      }),
    );

    expect(findPage).toHaveBeenCalledWith({
      actorId: '47772e7a-6dd4-4d56-846b-18bd693f46ca',
      actorType: ActorType.USER,
      action: 'role.grant_permission',
      entityType: EntityType.ROLES,
      entityId: '4e770b20-0ab6-494a-9bfd-e475e07c7a17',
      status: AuditStatus.FAILED,
      from,
      to,
      limit: 10,
      offset: 20,
    });
    expect(result).toMatchObject({ total: 0, page: 3, limit: 10 });
  });

  it('rejects an inverted date range before querying', async () => {
    const { handler, findPage } = setup();

    await expect(
      handler.execute(
        new ListAuditLogsQuery({
          from: new Date('2026-02-01T00:00:00.000Z'),
          to: new Date('2026-01-01T00:00:00.000Z'),
        }),
      ),
    ).rejects.toThrow(BadRequestException);

    expect(findPage).not.toHaveBeenCalled();
  });
});

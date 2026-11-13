import { describe, expect, it, jest } from '@jest/globals';
import { QueryBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { AuthGuard } from '../../../../shared/modules/security/auth.guard';
import { PermissionsGuard } from '../../../../shared/modules/security/permissions.guard';
import { AuditLogReadModel } from '../../application/queries/get-audit-log/audit-log.read-model';
import { GetAuditLogQuery } from '../../application/queries/get-audit-log/get-audit-log.query';
import { AuditLogPageReadModel } from '../../application/queries/list-audit-logs/audit-log-page.read-model';
import { ListAuditLogsQuery } from '../../application/queries/list-audit-logs/list-audit-logs.query';
import { AuditStatus } from '../../domain/enums/audit-status.enum';
import { EntityType } from '../../domain/enums/entity-type.enum';
import { AuditLogsController } from './audit-logs.controller';
import { ListAuditLogsRequest } from './requests/list-audit-logs.request';

const AUDIT_LOG_ID = '4e770b20-0ab6-494a-9bfd-e475e07c7a17';

type Execute = (query: unknown) => Promise<unknown>;

describe('AuditLogsController', () => {
  let controller: AuditLogsController;
  let execute: jest.Mock<Execute>;

  beforeEach(async () => {
    execute = jest.fn<Execute>();

    const module = await Test.createTestingModule({
      controllers: [AuditLogsController],
      providers: [{ provide: QueryBus, useValue: { execute } }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(AuditLogsController);
  });

  it('dispatches ListAuditLogsQuery with parsed filters', async () => {
    const page = new AuditLogPageReadModel([], 0, 2, 10);
    const request: ListAuditLogsRequest = {
      action: 'role.grant_permission',
      entityType: EntityType.ROLES,
      status: AuditStatus.FAILED,
      from: '2026-01-01T00:00:00.000Z',
      to: '2026-01-31T23:59:59.000Z',
      page: 2,
      limit: 10,
    };

    execute.mockResolvedValue(page);

    const result = await controller.findAll(request);

    expect(execute).toHaveBeenCalledWith(
      new ListAuditLogsQuery({
        action: 'role.grant_permission',
        entityType: EntityType.ROLES,
        status: AuditStatus.FAILED,
        from: new Date('2026-01-01T00:00:00.000Z'),
        to: new Date('2026-01-31T23:59:59.000Z'),
        page: 2,
        limit: 10,
      }),
    );
    expect(result).toBe(page);
  });

  it('dispatches GetAuditLogQuery by id', async () => {
    const readModel = { id: AUDIT_LOG_ID } as AuditLogReadModel;

    execute.mockResolvedValue(readModel);

    const result = await controller.findOne(AUDIT_LOG_ID);

    expect(execute).toHaveBeenCalledWith(new GetAuditLogQuery(AUDIT_LOG_ID));
    expect(result).toBe(readModel);
  });
});

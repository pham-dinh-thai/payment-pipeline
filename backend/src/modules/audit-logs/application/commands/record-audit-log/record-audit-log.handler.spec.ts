import { describe, expect, it, jest } from '@jest/globals';
import {
  AuditLog,
  CreateAuditLogProps,
} from '../../../domain/audit-log.aggregate';
import { IAuditLogsRepository } from '../../../domain/audit-logs.repository';
import { ActorType } from '../../../domain/enums/actor-type.enum';
import { AuditStatus } from '../../../domain/enums/audit-status.enum';
import { EntityType } from '../../../domain/enums/entity-type.enum';
import { IUnitOfWork } from '../../../../../shared/modules/unit-of-work/unit-of-work';
import { RecordAuditLogCommand } from './record-audit-log.command';
import { RecordAuditLogHandler } from './record-audit-log.handler';

type Create = (auditLog: AuditLog) => Promise<AuditLog>;
type Run = (work: () => Promise<unknown>) => Promise<unknown>;

const props: CreateAuditLogProps = {
  actorId: '47772e7a-6dd4-4d56-846b-18bd693f46ca',
  actorType: ActorType.USER,
  actorLabel: 'check@example.com',
  action: 'grant_permission',
  entityType: EntityType.ROLES,
  entityId: '4e770b20-0ab6-494a-9bfd-e475e07c7a17',
  status: AuditStatus.SUCCESS,
  before: { permissions: [] },
  after: { permissions: ['roles:read'] },
  metadata: { permission: 'roles:read' },
};

const setup = () => {
  const create = jest.fn<Create>((auditLog) => Promise.resolve(auditLog));
  const run = jest.fn<Run>((work) => work());

  const repository = {
    findById: jest.fn(),
    findByEntity: jest.fn(),
    findPage: jest.fn(),
    create,
  } as unknown as IAuditLogsRepository;
  const unitOfWork = { run } as unknown as IUnitOfWork;
  const handler = new RecordAuditLogHandler(repository, unitOfWork);

  return { handler, create, run };
};

describe('RecordAuditLogHandler', () => {
  it('records an audit log inside a unit of work', async () => {
    const { handler, create, run } = setup();

    const result = await handler.execute(new RecordAuditLogCommand(props));

    expect(result.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(run).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledTimes(1);

    const created = create.mock.calls[0][0];

    expect(created.getId()).toBe(result.id);
    expect(created.getAction()).toBe(props.action);
    expect(created.getActorType()).toBe(ActorType.USER);
    expect(created.getEntityType()).toBe(EntityType.ROLES);
    expect(created.getBefore()).toEqual(props.before);
    expect(created.getAfter()).toEqual(props.after);
    expect(created.getMetadata()).toEqual(props.metadata);
  });
});

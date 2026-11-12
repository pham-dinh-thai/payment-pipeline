import { describe, expect, it, jest } from '@jest/globals';
import { CommandBus } from '@nestjs/cqrs';
import { OutboxConsumerRegistry } from '../../../../shared/modules/outbox/application/outbox-consumer.registry';
import { type OutboxEvent } from '../../../../shared/modules/outbox/domain/outbox.repository';
import { ActorType } from '../../domain/enums/actor-type.enum';
import { AuditStatus } from '../../domain/enums/audit-status.enum';
import { EntityType } from '../../domain/enums/entity-type.enum';
import { RecordAuditLogCommand } from '../commands/record-audit-log/record-audit-log.command';
import { PERMISSION_GRANTED_EVENT } from '../../../authorization/domain/events/permission-granted.event';
import { ROLE_CREATED_EVENT } from '../../../authorization/domain/events/role-created.event';
import { AuditLogConsumer } from './audit-log.consumer';

const payload = {
  headers: {
    actorId: 'actor-1',
    actorType: 'user',
    actorLabel: 'admin@example.com',
    userIp: '127.0.0.1',
    userAgent: 'jest',
  },
  role: {
    id: 'role-1',
    name: 'manager',
    permissions: ['orders:read'],
    isSuperAdmin: false,
    createdAt: '2026-11-11T00:00:00.000Z',
  },
};

const outboxEvent = (eventType: string): OutboxEvent => ({
  id: 42,
  eventType,
  payload,
  createdAt: new Date('2026-11-11T00:00:00.000Z'),
  processed: false,
  attempts: 0,
  lastError: null,
  failedAt: null,
});

const setup = () => {
  const execute = jest.fn<
    (command: RecordAuditLogCommand) => Promise<{ id: string }>
  >(() => Promise.resolve({ id: 'audit-1' }));
  const registry = new OutboxConsumerRegistry();
  const consumer = new AuditLogConsumer(registry, {
    execute,
  } as unknown as CommandBus);

  consumer.onModuleInit();

  return { consumer, execute, registry };
};

describe('AuditLogConsumer', () => {
  it('registers one consumer for every audited event type', () => {
    const { consumer, registry } = setup();

    expect(registry.get(ROLE_CREATED_EVENT)).toBe(consumer);
    expect(registry.get(PERMISSION_GRANTED_EVENT)).toBe(consumer);
  });

  it('maps role.created to an audit entry', async () => {
    const { consumer, execute } = setup();

    await consumer.handle(outboxEvent(ROLE_CREATED_EVENT));

    const [command] = execute.mock.calls[0];

    expect(command.props).toEqual({
      occurredAt: new Date('2026-11-11T00:00:00.000Z'),
      actorId: 'actor-1',
      actorType: ActorType.USER,
      actorLabel: 'admin@example.com',
      action: 'role.created',
      entityType: EntityType.ROLES,
      entityId: 'role-1',
      status: AuditStatus.SUCCESS,
      after: {
        name: 'manager',
        permissions: ['orders:read'],
        isSuperAdmin: false,
      },
      metadata: { sourceEventId: 42 },
      ipAddress: '127.0.0.1',
      userAgent: 'jest',
    });
  });

  it('maps role.permission_granted to its own action', async () => {
    const { consumer, execute } = setup();

    await consumer.handle(outboxEvent(PERMISSION_GRANTED_EVENT));

    const [command] = execute.mock.calls[0];

    expect(command.props.action).toBe('role.permission_granted');
  });

  it('rejects event types without a mapping', async () => {
    const { consumer } = setup();

    await expect(consumer.handle(outboxEvent('role.unknown'))).rejects.toThrow(
      'No audit mapping registered for outbox event "role.unknown"',
    );
  });
});

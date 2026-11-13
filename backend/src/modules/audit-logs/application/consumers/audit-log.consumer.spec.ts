import { describe, expect, it, jest } from '@jest/globals';
import { CommandBus } from '@nestjs/cqrs';
import { OutboxConsumerRegistry } from '../../../../shared/modules/outbox/application/outbox-consumer.registry';
import { type OutboxEvent } from '../../../../shared/modules/outbox/domain/outbox.repository';
import { ActorType } from '../../domain/enums/actor-type.enum';
import { AuditStatus } from '../../domain/enums/audit-status.enum';
import { EntityType } from '../../domain/enums/entity-type.enum';
import { RecordAuditLogCommand } from '../commands/record-audit-log/record-audit-log.command';
import { ROLE_CREATED_EVENT } from '../../../authorization/domain/events/role-created.event';
import { AuditLogConsumer } from './audit-log.consumer';
import { AUDITED_EVENT_TYPES } from './audited-event-types';

const headers = {
  actorId: 'actor-1',
  actorType: 'user',
  actorLabel: 'admin@example.com',
  userIp: '127.0.0.1',
  userAgent: 'jest',
};

const payload = {
  headers,
  audit: {
    entityType: EntityType.ROLES,
    entityId: 'role-1',
    before: { name: 'old-name' },
    after: { name: 'new-name' },
    metadata: { permission: 'orders:read' },
    reason: 'manual fix',
  },
};

const outboxEvent = (
  eventType: string,
  eventPayload: Record<string, unknown> = payload,
): OutboxEvent => ({
  id: 42,
  eventType,
  payload: eventPayload,
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

    for (const eventType of AUDITED_EVENT_TYPES) {
      expect(registry.get(eventType)).toBe(consumer);
    }
  });

  it('turns a generic audit envelope into a record command', async () => {
    const { consumer, execute } = setup();

    await consumer.handle(outboxEvent(ROLE_CREATED_EVENT));

    const [command] = execute.mock.calls[0];

    expect(command.props).toEqual({
      occurredAt: new Date('2026-11-11T00:00:00.000Z'),
      actorId: 'actor-1',
      actorType: ActorType.USER,
      actorLabel: 'admin@example.com',
      action: 'create',
      entityType: EntityType.ROLES,
      entityId: 'role-1',
      status: AuditStatus.SUCCESS,
      before: { name: 'old-name' },
      after: { name: 'new-name' },
      metadata: { permission: 'orders:read', sourceEventId: 42 },
      reason: 'manual fix',
      ipAddress: '127.0.0.1',
      userAgent: 'jest',
    });
  });

  it('defaults missing before/after/metadata to empty values', async () => {
    const { consumer, execute } = setup();

    await consumer.handle(
      outboxEvent(ROLE_CREATED_EVENT, {
        headers,
        audit: {
          entityType: EntityType.ROLES,
          entityId: 'role-1',
        },
      }),
    );

    const [command] = execute.mock.calls[0];

    expect(command.props.before).toBeNull();
    expect(command.props.after).toBeNull();
    expect(command.props.metadata).toEqual({ sourceEventId: 42 });
    expect(command.props.reason).toBeNull();
  });

  it('treats non-user actors as SYSTEM', async () => {
    const { consumer, execute } = setup();

    await consumer.handle(
      outboxEvent(ROLE_CREATED_EVENT, {
        ...payload,
        headers: { ...headers, actorType: 'system' },
      }),
    );

    const [command] = execute.mock.calls[0];

    expect(command.props.actorType).toBe(ActorType.SYSTEM);
  });
});

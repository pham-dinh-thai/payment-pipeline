import { describe, expect, it, jest } from '@jest/globals';
import { EntityManager } from '@mikro-orm/core';
import { MikroOutboxEvent } from './entities/mikro-outbox-event.entity';
import { OutboxStatus } from './outbox-status.enum';
import { OutboxWriter } from './outbox-writer';

const setup = () => {
  const persist = jest.fn();
  const flush = jest.fn(() => Promise.resolve());
  const entityManager = {
    persist,
    flush,
  } as unknown as EntityManager;
  const writer = new OutboxWriter(entityManager);

  return { writer, persist, flush };
};

describe('OutboxWriter', () => {
  it('persists a pending event in the current entity manager', async () => {
    const { writer, persist, flush } = setup();

    const id = await writer.append({
      eventId: 'e2f0c8a3-9f2a-4f0f-8a0b-4f0c3d4e5f60',
      eventType: 'role.permission_granted',
      aggregateType: 'role',
      aggregateId: 'role-1',
      payload: { permission: 'roles:read' },
      headers: { requestId: 'req-1' },
    });

    expect(id).toBe('e2f0c8a3-9f2a-4f0f-8a0b-4f0c3d4e5f60');
    expect(persist).toHaveBeenCalledTimes(1);
    expect(flush).toHaveBeenCalledTimes(1);

    const event = persist.mock.calls[0][0] as MikroOutboxEvent;

    expect(event).toBeInstanceOf(MikroOutboxEvent);
    expect(event.id).toBe(id);
    expect(event.eventType).toBe('role.permission_granted');
    expect(event.eventVersion).toBe(1);
    expect(event.aggregateType).toBe('role');
    expect(event.aggregateId).toBe('role-1');
    expect(event.payload).toEqual({ permission: 'roles:read' });
    expect(event.headers).toEqual({ requestId: 'req-1' });
    expect(event.status).toBe(OutboxStatus.PENDING);
    expect(event.attempts).toBe(0);
    expect(event.lockedAt).toBeNull();
    expect(event.lockedBy).toBeNull();
    expect(event.processedAt).toBeNull();
    expect(event.lastError).toBeNull();
  });

  it('generates an event id and defaults when omitted', async () => {
    const { writer, persist } = setup();

    const id = await writer.append({
      eventType: 'role.created',
      aggregateType: 'role',
      aggregateId: 'role-1',
      payload: {},
    });

    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );

    const event = persist.mock.calls[0][0] as MikroOutboxEvent;

    expect(event.id).toBe(id);
    expect(event.headers).toEqual({});
    expect(event.occurredAt).toBeInstanceOf(Date);
    expect(event.availableAt).toBe(event.occurredAt);
  });

  it.each([
    ['eventType', { aggregateType: 'role', aggregateId: 'role-1' }],
    ['aggregateType', { eventType: 'role.created', aggregateId: 'role-1' }],
    ['aggregateId', { eventType: 'role.created', aggregateType: 'role' }],
  ])('rejects a missing %s', async (field, input) => {
    const { writer, persist } = setup();

    await expect(
      writer.append({
        ...input,
        payload: {},
      } as never),
    ).rejects.toThrow(`Outbox event ${field} must be a non-empty string`);

    expect(persist).not.toHaveBeenCalled();
  });

  it('rejects a non-object payload', async () => {
    const { writer, persist } = setup();

    await expect(
      writer.append({
        eventType: 'role.created',
        aggregateType: 'role',
        aggregateId: 'role-1',
        payload: null as unknown as object,
      }),
    ).rejects.toThrow('Outbox event payload must be an object');

    expect(persist).not.toHaveBeenCalled();
  });

  it('rejects a payload that cannot be serialised', async () => {
    const { writer, persist } = setup();
    const payload: Record<string, unknown> = {};
    payload.self = payload;

    await expect(
      writer.append({
        eventType: 'role.created',
        aggregateType: 'role',
        aggregateId: 'role-1',
        payload,
      }),
    ).rejects.toThrow('Outbox event payload must be JSON serialisable');

    expect(persist).not.toHaveBeenCalled();
  });
});

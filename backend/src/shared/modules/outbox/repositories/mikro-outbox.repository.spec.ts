import { describe, expect, it, jest } from '@jest/globals';
import { EntityManager, LockMode } from '@mikro-orm/core';
import { MikroOutboxEvent } from '../entities/mikro-outbox-event.entity';
import { OutboxStatus } from '../outbox-status.enum';
import { MikroOutboxRepository } from './mikro-outbox.repository';

const makeEntity = (): MikroOutboxEvent => {
  const event = new MikroOutboxEvent();

  event.id = 'e2f0c8a3-9f2a-4f0f-8a0b-4f0c3d4e5f60';
  event.sequence = '42';
  event.eventType = 'role.permission_granted';
  event.eventVersion = 1;
  event.aggregateType = 'role';
  event.aggregateId = 'role-1';
  event.payload = { permission: 'roles:read' };
  event.headers = { requestId: 'req-1' };
  event.occurredAt = new Date('2026-11-10T00:00:00.000Z');
  event.status = OutboxStatus.PENDING;
  event.attempts = 0;

  return event;
};

const setup = () => {
  const find = jest.fn<(...args: unknown[]) => Promise<MikroOutboxEvent[]>>();
  const nativeUpdate = jest.fn<(...args: unknown[]) => Promise<number>>();
  const transactionalEntityManager = { find } as unknown as EntityManager;
  const entityManager = {
    transactional: jest.fn((callback: (em: EntityManager) => unknown) =>
      Promise.resolve(callback(transactionalEntityManager)),
    ),
    nativeUpdate,
  } as unknown as EntityManager;
  const repository = new MikroOutboxRepository(entityManager);

  return { repository, find, nativeUpdate, transactionalEntityManager };
};

describe('MikroOutboxRepository', () => {
  it('claims pending events with SKIP LOCKED and marks them processing', async () => {
    const { repository, find } = setup();
    const event = makeEntity();

    find.mockResolvedValue([event]);

    const result = await repository.claimBatch(50, 'worker-1');

    expect(find).toHaveBeenCalledWith(
      MikroOutboxEvent,
      {
        status: OutboxStatus.PENDING,
        availableAt: { $lte: expect.any(Date) },
      },
      {
        orderBy: { sequence: 'asc' },
        limit: 50,
        lockMode: LockMode.PESSIMISTIC_PARTIAL_WRITE,
      },
    );

    expect(event.status).toBe(OutboxStatus.PROCESSING);
    expect(event.lockedAt).toBeInstanceOf(Date);
    expect(event.lockedBy).toBe('worker-1');
    expect(event.attempts).toBe(1);

    expect(result).toEqual([
      {
        id: event.id,
        sequence: '42',
        eventType: event.eventType,
        eventVersion: 1,
        aggregateType: 'role',
        aggregateId: 'role-1',
        payload: { permission: 'roles:read' },
        headers: { requestId: 'req-1' },
        occurredAt: event.occurredAt,
        attempts: 1,
      },
    ]);
  });

  it('marks an event processed only while the worker still holds the lease', async () => {
    const { repository, nativeUpdate } = setup();

    nativeUpdate.mockResolvedValue(1);

    await expect(repository.markProcessed('event-1', 'worker-1')).resolves.toBe(
      true,
    );

    expect(nativeUpdate).toHaveBeenCalledWith(
      MikroOutboxEvent,
      {
        id: 'event-1',
        status: OutboxStatus.PROCESSING,
        lockedBy: 'worker-1',
      },
      {
        status: OutboxStatus.PROCESSED,
        processedAt: expect.any(Date),
        lockedAt: null,
        lockedBy: null,
        lastError: null,
      },
    );

    nativeUpdate.mockResolvedValue(0);

    await expect(repository.markProcessed('event-1', 'worker-1')).resolves.toBe(
      false,
    );
  });

  it('reschedules a failed event for the future', async () => {
    const { repository, nativeUpdate } = setup();
    const before = Date.now();

    nativeUpdate.mockResolvedValue(1);

    await repository.reschedule('event-1', 'worker-1', 5000, 'boom');

    const [, , update] = nativeUpdate.mock.calls[0] as [
      unknown,
      unknown,
      { status: OutboxStatus; availableAt: Date; lastError: string },
    ];

    expect(update.status).toBe(OutboxStatus.PENDING);
    expect(update.availableAt.getTime()).toBeGreaterThanOrEqual(before + 5000);
    expect(update.lastError).toBe('boom');
  });

  it('moves an event to failed and records the error', async () => {
    const { repository, nativeUpdate } = setup();

    nativeUpdate.mockResolvedValue(1);

    await repository.markFailed('event-1', 'worker-1', 'boom');

    expect(nativeUpdate).toHaveBeenCalledWith(
      MikroOutboxEvent,
      {
        id: 'event-1',
        status: OutboxStatus.PROCESSING,
        lockedBy: 'worker-1',
      },
      {
        status: OutboxStatus.FAILED,
        lockedAt: null,
        lockedBy: null,
        lastError: 'boom',
      },
    );
  });

  it('releases stale processing events', async () => {
    const { repository, nativeUpdate } = setup();
    const cutoff = new Date('2026-11-10T00:00:00.000Z');

    nativeUpdate.mockResolvedValue(3);

    await expect(repository.releaseStale(cutoff)).resolves.toBe(3);

    expect(nativeUpdate).toHaveBeenCalledWith(
      MikroOutboxEvent,
      {
        status: OutboxStatus.PROCESSING,
        lockedAt: { $lte: cutoff },
      },
      {
        status: OutboxStatus.PENDING,
        availableAt: expect.any(Date),
        lockedAt: null,
        lockedBy: null,
      },
    );
  });
});

import { describe, expect, it, jest } from '@jest/globals';
import { IOutboxRepository, OutboxEvent } from '../domain/outbox.repository';
import { IUnitOfWork } from '../../unit-of-work/unit-of-work';
import { OutboxConsumerRegistry } from './outbox-consumer.registry';
import { OutboxRelay } from './outbox-relay.service';

const pending = (id: number, eventType: string): OutboxEvent => ({
  id,
  eventType,
  payload: {},
  createdAt: new Date(),
  processed: false,
  attempts: 0,
  lastError: null,
  failedAt: null,
});

const setup = (events: OutboxEvent[]) => {
  const findPending = jest.fn<(limit: number) => Promise<OutboxEvent[]>>(() =>
    Promise.resolve(events),
  );
  const markProcessed = jest.fn<(id: number) => Promise<void>>(() =>
    Promise.resolve(),
  );
  const recordFailure = jest.fn<
    (id: number, error: string, maxAttempts: number) => Promise<void>
  >(() => Promise.resolve());
  const repository = {
    findPending,
    markProcessed,
    recordFailure,
  } as unknown as IOutboxRepository;
  const registry = new OutboxConsumerRegistry();
  const unitOfWork = {
    run: jest.fn((callback: () => Promise<unknown>) => callback()),
  } as unknown as IUnitOfWork;
  const relay = new OutboxRelay(repository, registry, unitOfWork);

  return { relay, findPending, markProcessed, recordFailure, registry };
};

describe('OutboxRelay', () => {
  it('dispatches pending events and marks them processed', async () => {
    const { relay, markProcessed, recordFailure, registry } = setup([
      pending(1, 'role.created'),
      pending(2, 'role.created'),
    ]);
    const handle = jest.fn(() => Promise.resolve());
    registry.register('role.created', { handle });

    await relay.poll();

    expect(handle.mock.calls).toEqual([
      [expect.objectContaining({ id: 1 })],
      [expect.objectContaining({ id: 2 })],
    ]);
    expect(markProcessed.mock.calls).toEqual([[1], [2]]);
    expect(recordFailure.mock.calls).toHaveLength(0);
  });

  it('keeps the event pending and records the failure when the consumer fails', async () => {
    const { relay, markProcessed, recordFailure, registry } = setup([
      pending(1, 'role.created'),
    ]);
    registry.register('role.created', {
      handle: () => Promise.reject(new Error('consumer failed')),
    });

    await relay.poll();

    expect(markProcessed.mock.calls).toHaveLength(0);
    expect(recordFailure.mock.calls).toEqual([
      [1, 'consumer failed', expect.any(Number)],
    ]);
  });

  it('keeps processing the batch when recording a failure itself fails', async () => {
    const { relay, recordFailure, registry } = setup([
      pending(1, 'role.created'),
      pending(2, 'role.created'),
    ]);
    recordFailure.mockRejectedValue(new Error('database down'));
    const handle = jest
      .fn<(event: OutboxEvent) => Promise<void>>()
      .mockRejectedValueOnce(new Error('consumer failed'))
      .mockResolvedValueOnce(undefined);
    registry.register('role.created', { handle });

    await relay.poll();

    expect(handle.mock.calls).toHaveLength(2);
  });

  it('keeps the event pending when no consumer is registered', async () => {
    const { relay, markProcessed, recordFailure } = setup([
      pending(1, 'role.created'),
    ]);

    await relay.poll();

    expect(markProcessed.mock.calls).toHaveLength(0);
    expect(recordFailure.mock.calls).toHaveLength(0);
  });
});

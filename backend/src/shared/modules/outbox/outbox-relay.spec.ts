import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OutboxConsumer } from './outbox-consumer';
import { OutboxConsumerRegistry } from './outbox-consumer.registry';
import { OutboxEvent } from './outbox-event';
import { OutboxRelay } from './outbox-relay';
import type { IOutboxRepository } from './repositories/outbox.repository';

type ClaimBatch = (limit: number, workerId: string) => Promise<OutboxEvent[]>;
type MarkProcessed = (eventId: string, workerId: string) => Promise<boolean>;
type MarkFailed = (
  eventId: string,
  workerId: string,
  error: string,
) => Promise<boolean>;
type Reschedule = (
  eventId: string,
  workerId: string,
  delayMs: number,
  error: string,
) => Promise<boolean>;
type Release = (lockedBefore: Date) => Promise<number>;
type GetConsumer = (eventType: string) => OutboxConsumer | undefined;

const makeEvent = (overrides: Partial<OutboxEvent> = {}): OutboxEvent => ({
  id: 'e2f0c8a3-9f2a-4f0f-8a0b-4f0c3d4e5f60',
  sequence: '1',
  eventType: 'role.permission_granted',
  eventVersion: 1,
  aggregateType: 'role',
  aggregateId: 'role-1',
  payload: { permission: 'roles:read' },
  headers: {},
  occurredAt: new Date('2026-11-10T00:00:00.000Z'),
  attempts: 1,
  ...overrides,
});

const makeConfig = (
  values: Record<string, string | number | boolean> = {},
): ConfigService =>
  ({
    get: (key: string) => values[key],
  }) as unknown as ConfigService;

const setup = (values: Record<string, string | number | boolean> = {}) => {
  const claimBatch = jest.fn<ClaimBatch>();
  const markProcessed = jest.fn<MarkProcessed>();
  const reschedule = jest.fn<Reschedule>();
  const markFailed = jest.fn<MarkFailed>();
  const releaseStale = jest.fn<Release>();
  const get = jest.fn<GetConsumer>();
  const handle = jest.fn<(event: OutboxEvent) => Promise<void>>();

  const repository: IOutboxRepository = {
    claimBatch,
    markProcessed,
    reschedule,
    markFailed,
    releaseStale,
  };
  const registry = { get } as unknown as OutboxConsumerRegistry;
  const consumer: OutboxConsumer = { handle };

  claimBatch.mockResolvedValue([]);
  releaseStale.mockResolvedValue(0);
  markProcessed.mockResolvedValue(true);
  reschedule.mockResolvedValue(true);
  markFailed.mockResolvedValue(true);
  handle.mockResolvedValue();
  get.mockReturnValue(consumer);

  const relay = new OutboxRelay(makeConfig(values), repository, registry);

  return {
    relay,
    claimBatch,
    markProcessed,
    reschedule,
    markFailed,
    releaseStale,
    get,
    handle,
    consumer,
  };
};

describe('OutboxRelay', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('delivers a claimed event and marks it processed', async () => {
    const { relay, claimBatch, markProcessed, get, handle } = setup();
    const event = makeEvent();

    claimBatch.mockResolvedValueOnce([event]);
    get.mockReturnValue({ handle });

    await relay.runOnce();

    expect(get).toHaveBeenCalledWith('role.permission_granted');
    expect(handle).toHaveBeenCalledWith(event);
    expect(markProcessed).toHaveBeenCalledWith(event.id, expect.any(String));
  });

  it('reschedules a failed event with exponential backoff', async () => {
    const { relay, claimBatch, markProcessed, reschedule, markFailed, handle } =
      setup();
    const event = makeEvent({ attempts: 1 });

    claimBatch.mockResolvedValueOnce([event]);
    handle.mockRejectedValue(new Error('consumer exploded'));

    await relay.runOnce();

    expect(markProcessed).not.toHaveBeenCalled();
    expect(markFailed).not.toHaveBeenCalled();
    expect(reschedule).toHaveBeenCalledTimes(1);

    const [eventId, , delayMs, error] = reschedule.mock.calls[0];

    expect(eventId).toBe(event.id);
    expect(delayMs).toBeGreaterThanOrEqual(1000);
    expect(delayMs).toBeLessThan(2000);
    expect(error).toContain('consumer exploded');
  });

  it('moves an event to failed once max attempts are reached', async () => {
    const { relay, claimBatch, markProcessed, reschedule, markFailed, handle } =
      setup({ OUTBOX_MAX_ATTEMPTS: 2 });
    const event = makeEvent({ attempts: 2 });

    claimBatch.mockResolvedValueOnce([event]);
    handle.mockRejectedValue(new Error('still broken'));

    await relay.runOnce();

    expect(markProcessed).not.toHaveBeenCalled();
    expect(reschedule).not.toHaveBeenCalled();
    expect(markFailed).toHaveBeenCalledWith(
      event.id,
      expect.any(String),
      expect.stringContaining('still broken'),
    );
  });

  it('treats a missing consumer as a retryable failure', async () => {
    const { relay, claimBatch, get, reschedule, markFailed } = setup();
    const event = makeEvent({ attempts: 1 });

    claimBatch.mockResolvedValueOnce([event]);
    get.mockReturnValue(undefined);

    await relay.runOnce();

    expect(markFailed).not.toHaveBeenCalled();
    expect(reschedule).toHaveBeenCalledWith(
      event.id,
      expect.any(String),
      expect.any(Number),
      expect.stringContaining('No outbox consumer registered'),
    );
  });

  it('releases stale events before claiming new ones', async () => {
    const { relay, releaseStale } = setup({
      OUTBOX_LEASE_TIMEOUT_MS: 300000,
    });

    await relay.runOnce();

    expect(releaseStale).toHaveBeenCalledTimes(1);

    const cutoff = releaseStale.mock.calls[0][0];
    const age = Date.now() - cutoff.getTime();

    expect(age).toBeGreaterThanOrEqual(300000);
    expect(age).toBeLessThan(302000);
  });

  it('does nothing when the relay is disabled', async () => {
    const { relay, claimBatch, releaseStale } = setup({
      OUTBOX_RELAY_ENABLED: 'false',
    });

    await relay.runOnce();

    expect(releaseStale).not.toHaveBeenCalled();
    expect(claimBatch).not.toHaveBeenCalled();
  });

  it('keeps draining while full batches are returned', async () => {
    const { relay, claimBatch, markProcessed } = setup({
      OUTBOX_BATCH_SIZE: 2,
    });
    const first = makeEvent({ id: 'event-1' });
    const second = makeEvent({ id: 'event-2' });

    claimBatch.mockResolvedValueOnce([first, second]).mockResolvedValueOnce([]);

    await relay.runOnce();

    expect(claimBatch).toHaveBeenCalledTimes(2);
    expect(markProcessed).toHaveBeenCalledTimes(2);
  });
});

import { describe, expect, it, jest } from '@jest/globals';
import { OutboxConsumer } from './outbox-consumer';
import { OutboxConsumerRegistry } from './outbox-consumer.registry';

const consumer = {
  handle: jest.fn(() => Promise.resolve()),
} as unknown as OutboxConsumer;

describe('OutboxConsumerRegistry', () => {
  it('registers one consumer for multiple event types', () => {
    const registry = new OutboxConsumerRegistry();

    registry.register(['role.created', 'role.renamed'], consumer);

    expect(registry.get('role.created')).toBe(consumer);
    expect(registry.get('role.renamed')).toBe(consumer);
    expect(registry.has('role.deleted')).toBe(false);
  });

  it('rejects two consumers for the same event type', () => {
    const registry = new OutboxConsumerRegistry();
    const other = {} as OutboxConsumer;

    registry.register('role.created', consumer);

    expect(() => registry.register('role.created', other)).toThrow(
      'An outbox consumer is already registered for event type "role.created"',
    );
  });
});

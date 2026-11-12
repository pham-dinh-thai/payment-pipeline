import { describe, expect, it, jest } from '@jest/globals';
import { OutboxConsumerRegistry } from './outbox-consumer.registry';

const consumer = () => ({
  handle: jest.fn(() => Promise.resolve()),
});

describe('OutboxConsumerRegistry', () => {
  it('returns the consumer registered for an event type', () => {
    const registry = new OutboxConsumerRegistry();
    const roleCreatedConsumer = consumer();

    registry.register('role.created', roleCreatedConsumer);

    expect(registry.get('role.created')).toBe(roleCreatedConsumer);
  });

  it('returns undefined for an unknown event type', () => {
    const registry = new OutboxConsumerRegistry();

    expect(registry.get('role.created')).toBeUndefined();
  });

  it('rejects a second consumer for the same event type', () => {
    const registry = new OutboxConsumerRegistry();

    registry.register('role.created', consumer());

    expect(() => registry.register('role.created', consumer())).toThrow(
      'Duplicate outbox consumer for event type "role.created"',
    );
  });
});

import { OutboxEvent } from './outbox-event';

export interface OutboxConsumer<TPayload = Record<string, unknown>> {
  handle(event: OutboxEvent<TPayload>): Promise<void>;
}

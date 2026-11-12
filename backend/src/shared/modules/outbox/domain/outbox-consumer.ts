import { OutboxEvent } from './outbox.repository';

export interface OutboxConsumer {
  handle(event: OutboxEvent): Promise<void>;
}

import { Injectable } from '@nestjs/common';
import { OutboxConsumer } from './outbox-consumer';

@Injectable()
export class OutboxConsumerRegistry {
  private readonly consumers = new Map<string, OutboxConsumer>();

  public register(
    eventTypes: string | readonly string[],
    consumer: OutboxConsumer,
  ): void {
    const types = typeof eventTypes === 'string' ? [eventTypes] : eventTypes;

    for (const eventType of types) {
      if (this.consumers.has(eventType)) {
        throw new Error(
          `An outbox consumer is already registered for event type "${eventType}"`,
        );
      }

      this.consumers.set(eventType, consumer);
    }
  }

  public get(eventType: string): OutboxConsumer | undefined {
    return this.consumers.get(eventType);
  }

  public has(eventType: string): boolean {
    return this.consumers.has(eventType);
  }
}

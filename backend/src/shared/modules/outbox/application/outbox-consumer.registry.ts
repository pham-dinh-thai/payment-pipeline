import { Injectable } from '@nestjs/common';
import { OutboxConsumer } from '../domain/outbox-consumer';

@Injectable()
export class OutboxConsumerRegistry {
  private readonly consumers = new Map<string, OutboxConsumer>();

  public register(eventType: string, consumer: OutboxConsumer): void {
    if (this.consumers.has(eventType)) {
      throw new Error(
        `Duplicate outbox consumer for event type "${eventType}"`,
      );
    }

    this.consumers.set(eventType, consumer);
  }

  public get(eventType: string): OutboxConsumer | undefined {
    return this.consumers.get(eventType);
  }
}

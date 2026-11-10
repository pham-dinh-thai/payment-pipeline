import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { MikroOutboxEvent } from './entities/mikro-outbox-event.entity';
import { AppendOutboxEventInput, normaliseAppendInput } from './outbox-event';
import { OutboxStatus } from './outbox-status.enum';

@Injectable()
export class OutboxWriter {
  public constructor(private readonly entityManager: EntityManager) {}

  /**
   * Persists an event in the caller's current unit of work. It deliberately
   * does not open a transaction: the event must commit (or roll back) together
   * with the business state.
   */
  public async append<TPayload extends object>(
    input: AppendOutboxEventInput<TPayload>,
  ): Promise<string> {
    this.assertRequiredString(input.eventType, 'eventType');
    this.assertRequiredString(input.aggregateType, 'aggregateType');
    this.assertRequiredString(input.aggregateId, 'aggregateId');

    if (input.payload === null || typeof input.payload !== 'object') {
      throw new TypeError('Outbox event payload must be an object');
    }

    const event = normaliseAppendInput(input);

    this.assertSerialisable(event.payload, 'payload');
    this.assertSerialisable(event.headers, 'headers');

    const mikroOutboxEvent = new MikroOutboxEvent();
    mikroOutboxEvent.id = event.eventId;
    mikroOutboxEvent.eventType = event.eventType;
    mikroOutboxEvent.eventVersion = event.eventVersion;
    mikroOutboxEvent.aggregateType = event.aggregateType;
    mikroOutboxEvent.aggregateId = event.aggregateId;
    mikroOutboxEvent.payload = event.payload as Record<string, unknown>;
    mikroOutboxEvent.headers = event.headers;
    mikroOutboxEvent.occurredAt = event.occurredAt;
    mikroOutboxEvent.status = OutboxStatus.PENDING;
    mikroOutboxEvent.attempts = 0;
    mikroOutboxEvent.availableAt = event.occurredAt;
    mikroOutboxEvent.lockedAt = null;
    mikroOutboxEvent.lockedBy = null;
    mikroOutboxEvent.processedAt = null;
    mikroOutboxEvent.lastError = null;

    this.entityManager.persist(mikroOutboxEvent);
    await this.entityManager.flush();

    return mikroOutboxEvent.id;
  }

  private assertRequiredString(value: unknown, field: string): void {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new TypeError(`Outbox event ${field} must be a non-empty string`);
    }
  }

  private assertSerialisable(value: unknown, field: string): void {
    try {
      JSON.stringify(value);
    } catch {
      throw new TypeError(`Outbox event ${field} must be JSON serialisable`);
    }
  }
}

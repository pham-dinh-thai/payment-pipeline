import { randomUUID } from 'node:crypto';

/**
 * A domain event that was committed together with the business state that
 * produced it. The event is delivered to exactly one consumer, which is why the
 * delivery state lives on the outbox row itself.
 */
export interface OutboxEvent<TPayload = Record<string, unknown>> {
  id: string;
  sequence: string;
  eventType: string;
  eventVersion: number;
  aggregateType: string;
  aggregateId: string;
  payload: TPayload;
  headers: Record<string, unknown>;
  occurredAt: Date;
  attempts: number;
}

export interface AppendOutboxEventInput<TPayload = Record<string, unknown>> {
  eventId?: string;
  eventType: string;
  eventVersion?: number;
  aggregateType: string;
  aggregateId: string;
  payload: TPayload;
  headers?: Record<string, unknown>;
  occurredAt?: Date;
}

export const OUTBOX_DEFAULT_EVENT_VERSION = 1;

export function normaliseAppendInput<TPayload>(
  input: AppendOutboxEventInput<TPayload>,
): Required<AppendOutboxEventInput<TPayload>> {
  return {
    eventId: input.eventId ?? randomUUID(),
    eventType: input.eventType,
    eventVersion: input.eventVersion ?? OUTBOX_DEFAULT_EVENT_VERSION,
    aggregateType: input.aggregateType,
    aggregateId: input.aggregateId,
    payload: input.payload,
    headers: input.headers ?? {},
    occurredAt: input.occurredAt ?? new Date(),
  };
}

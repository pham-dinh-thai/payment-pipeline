import { OutboxEvent } from '../outbox-event';

export interface IOutboxRepository {
  /**
   * Locks the next batch of pending events and marks them as processing in a
   * single transaction. Uses `FOR UPDATE SKIP LOCKED` so multiple relay
   * instances can run concurrently without claiming the same event.
   */
  claimBatch(limit: number, workerId: string): Promise<OutboxEvent[]>;

  markProcessed(eventId: string, workerId: string): Promise<boolean>;

  reschedule(
    eventId: string,
    workerId: string,
    delayMs: number,
    error: string,
  ): Promise<boolean>;

  markFailed(
    eventId: string,
    workerId: string,
    error: string,
  ): Promise<boolean>;

  /**
   * Releases events whose worker died while they were being processed.
   * Returns the number of events that were released.
   */
  releaseStale(lockedBefore: Date): Promise<number>;
}

export const OUTBOX_REPOSITORY = 'IOutboxRepository';

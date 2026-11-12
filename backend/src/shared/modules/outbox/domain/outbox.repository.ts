export type OutboxEvent = {
  id: number;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: Date;
  processed: boolean;
  attempts: number;
  lastError: string | null;
  failedAt: Date | null;
};

export interface IOutboxRepository {
  create(props: {
    eventType: string;
    payload: Record<string, unknown>;
  }): Promise<void>;

  findPending(limit: number): Promise<OutboxEvent[]>;

  markProcessed(id: number): Promise<void>;

  recordFailure(id: number, error: string, maxAttempts: number): Promise<void>;
}

export const OUTBOX_REPOSITORY = 'IOutboxRepository';

import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager, raw } from '@mikro-orm/core';
import { IOutboxRepository, OutboxEvent } from '../domain/outbox.repository';
import { MikroOutBoxEvent } from './mikro-outbox-event.entity';

@Injectable()
export class MikroOutBoxRepository implements IOutboxRepository {
  public constructor(private readonly entityManager: EntityManager) {}

  public async create(props: {
    eventType: string;
    payload: Record<string, unknown>;
  }): Promise<void> {
    const mikroOutbox = this.entityManager.create(MikroOutBoxEvent, {
      eventType: props.eventType,
      payload: props.payload,
      createdAt: new Date(),
      processed: false,
      attempts: 0,
    });

    await this.entityManager.insert(mikroOutbox);
  }

  public async findPending(limit: number): Promise<OutboxEvent[]> {
    // The relay opens a request context around each poll, so this EM resolves
    // to that context instead of the global one.
    const events = await this.entityManager.find(
      MikroOutBoxEvent,
      { processed: false, failedAt: null },
      { orderBy: { id: 'asc' }, limit },
    );

    return events.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      payload: event.payload,
      createdAt: event.createdAt,
      processed: event.processed,
      attempts: event.attempts,
      lastError: event.lastError,
      failedAt: event.failedAt,
    }));
  }

  public async markProcessed(id: number): Promise<void> {
    // Runs inside the relay dispatch transaction, so the processed flag commits
    // atomically with the consumer's writes.
    const affected = await this.entityManager.nativeUpdate(
      MikroOutBoxEvent,
      { id },
      { processed: true },
    );

    if (affected === 0) {
      throw new NotFoundException(`Outbox event ${id} not found`);
    }
  }

  public async recordFailure(
    id: number,
    error: string,
    maxAttempts: number,
  ): Promise<void> {
    // The dispatch transaction has rolled back, so this write has to run on
    // its own connection. Otherwise it would roll back together with the
    // failure it is supposed to record.
    const entityManager = this.entityManager.fork();

    await entityManager.nativeUpdate(
      MikroOutBoxEvent,
      { id },
      {
        attempts: raw('attempts + 1'),
        lastError: error,
        failedAt: raw('case when attempts + 1 >= ? then now() else null end', [
          maxAttempts,
        ]),
      },
    );
  }
}

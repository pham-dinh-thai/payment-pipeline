import { Injectable } from '@nestjs/common';
import { EntityManager, LockMode } from '@mikro-orm/core';
import { MikroOutboxEvent } from '../entities/mikro-outbox-event.entity';
import { OutboxEvent } from '../outbox-event';
import { OutboxStatus } from '../outbox-status.enum';
import { IOutboxRepository } from './outbox.repository';

const MAX_ERROR_LENGTH = 8000;

@Injectable()
export class MikroOutboxRepository implements IOutboxRepository {
  public constructor(private readonly entityManager: EntityManager) {}

  public claimBatch(limit: number, workerId: string): Promise<OutboxEvent[]> {
    return this.entityManager.transactional(async (entityManager) => {
      const now = new Date();

      const events = await entityManager.find(
        MikroOutboxEvent,
        {
          status: OutboxStatus.PENDING,
          availableAt: { $lte: now },
        },
        {
          orderBy: { sequence: 'asc' },
          limit,
          lockMode: LockMode.PESSIMISTIC_PARTIAL_WRITE,
        },
      );

      for (const event of events) {
        event.status = OutboxStatus.PROCESSING;
        event.lockedAt = now;
        event.lockedBy = workerId;
        event.attempts += 1;
      }

      return events.map((event) => this.toOutboxEvent(event));
    });
  }

  public async markProcessed(
    eventId: string,
    workerId: string,
  ): Promise<boolean> {
    const updated = await this.entityManager.nativeUpdate(
      MikroOutboxEvent,
      {
        id: eventId,
        status: OutboxStatus.PROCESSING,
        lockedBy: workerId,
      },
      {
        status: OutboxStatus.PROCESSED,
        processedAt: new Date(),
        lockedAt: null,
        lockedBy: null,
        lastError: null,
      },
    );

    return updated > 0;
  }

  public async reschedule(
    eventId: string,
    workerId: string,
    delayMs: number,
    error: string,
  ): Promise<boolean> {
    const updated = await this.entityManager.nativeUpdate(
      MikroOutboxEvent,
      {
        id: eventId,
        status: OutboxStatus.PROCESSING,
        lockedBy: workerId,
      },
      {
        status: OutboxStatus.PENDING,
        availableAt: new Date(Date.now() + delayMs),
        lockedAt: null,
        lockedBy: null,
        lastError: this.truncateError(error),
      },
    );

    return updated > 0;
  }

  public async markFailed(
    eventId: string,
    workerId: string,
    error: string,
  ): Promise<boolean> {
    const updated = await this.entityManager.nativeUpdate(
      MikroOutboxEvent,
      {
        id: eventId,
        status: OutboxStatus.PROCESSING,
        lockedBy: workerId,
      },
      {
        status: OutboxStatus.FAILED,
        lockedAt: null,
        lockedBy: null,
        lastError: this.truncateError(error),
      },
    );

    return updated > 0;
  }

  public async releaseStale(lockedBefore: Date): Promise<number> {
    return this.entityManager.nativeUpdate(
      MikroOutboxEvent,
      {
        status: OutboxStatus.PROCESSING,
        lockedAt: { $lte: lockedBefore },
      },
      {
        status: OutboxStatus.PENDING,
        availableAt: new Date(),
        lockedAt: null,
        lockedBy: null,
      },
    );
  }

  private toOutboxEvent(event: MikroOutboxEvent): OutboxEvent {
    return {
      id: event.id,
      sequence: String(event.sequence),
      eventType: event.eventType,
      eventVersion: event.eventVersion,
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      payload: event.payload,
      headers: event.headers,
      occurredAt: event.occurredAt,
      attempts: event.attempts,
    };
  }

  private truncateError(error: string): string {
    return error.length > MAX_ERROR_LENGTH
      ? error.slice(0, MAX_ERROR_LENGTH)
      : error;
  }
}

import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import {
  type IOutboxRepository,
  OUTBOX_REPOSITORY,
  type OutboxEvent,
} from '../domain/outbox.repository';
import { OutboxConsumerRegistry } from './outbox-consumer.registry';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../unit-of-work/unit-of-work';

const DEFAULT_BATCH_SIZE = 50;
const DEFAULT_POLL_INTERVAL_MS = 1000;
const DEFAULT_MAX_ATTEMPTS = 5;
const MAX_ERROR_LENGTH = 2000;

@Injectable()
export class OutboxRelay implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxRelay.name);
  private timer?: NodeJS.Timeout;
  private polling = false;

  public constructor(
    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepository: IOutboxRepository,

    private readonly registry: OutboxConsumerRegistry,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,

    @Optional() private readonly orm?: MikroORM,
  ) {}

  public onModuleInit(): void {
    if (process.env.OUTBOX_RELAY_ENABLED !== 'true') {
      this.logger.log('Outbox relay is disabled');
      return;
    }

    this.timer = setInterval(() => {
      void this.poll();
    }, this.pollIntervalMs);
  }

  public onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  public poll(): Promise<void> {
    // Consumers may use request-scoped services such as UnitOfWork, which
    // resolve the EntityManager through the request context. The relay runs
    // outside a request, so it has to create that context explicitly.
    if (!this.orm) {
      return this.pollOnce();
    }

    return RequestContext.create(this.orm.em, () => this.pollOnce());
  }

  private async pollOnce(): Promise<void> {
    if (this.polling) {
      return;
    }

    this.polling = true;

    try {
      const events = await this.outboxRepository.findPending(this.batchSize);

      for (const event of events) {
        await this.dispatch(event);
      }
    } catch (error) {
      this.logger.error(`Outbox poll failed: ${this.messageOf(error)}`);
    } finally {
      this.polling = false;
    }
  }

  private async dispatch(event: OutboxEvent): Promise<void> {
    const consumer = this.registry.get(event.eventType);

    if (!consumer) {
      this.logger.warn(
        `No outbox consumer registered for "${event.eventType}"`,
      );
      return;
    }

    try {
      // The consumer's writes and the processed flag commit together. If either
      // fails, the transaction rolls back and the event stays pending.
      await this.unitOfWork.run(async () => {
        await consumer.handle(event);
        await this.outboxRepository.markProcessed(event.id);
      });
    } catch (error) {
      await this.recordFailure(event, error);
    }
  }

  private async recordFailure(
    event: OutboxEvent,
    error: unknown,
  ): Promise<void> {
    const message = this.messageOf(error).slice(0, MAX_ERROR_LENGTH);
    const attempts = event.attempts + 1;
    const maxAttempts = this.maxAttempts;

    try {
      await this.outboxRepository.recordFailure(event.id, message, maxAttempts);
    } catch (persistError) {
      // Losing the failure record must not stop the rest of the batch, but it
      // has to be visible: this is the only trace left.
      this.logger.error(
        `Failed to record failure for outbox event ${event.id} (${event.eventType}): ${this.messageOf(persistError)}`,
      );
      return;
    }

    if (attempts >= maxAttempts) {
      this.logger.error(
        `Outbox event ${event.id} (${event.eventType}) failed permanently after ${attempts} attempts: ${message}`,
      );
      return;
    }

    this.logger.warn(
      `Outbox event ${event.id} (${event.eventType}) failed (attempt ${attempts}/${maxAttempts}): ${message}`,
    );
  }

  private get batchSize(): number {
    return this.readPositiveNumber(
      process.env.OUTBOX_BATCH_SIZE,
      DEFAULT_BATCH_SIZE,
    );
  }

  private get pollIntervalMs(): number {
    return this.readPositiveNumber(
      process.env.OUTBOX_POLL_INTERVAL_MS,
      DEFAULT_POLL_INTERVAL_MS,
    );
  }

  private get maxAttempts(): number {
    return Math.floor(
      this.readPositiveNumber(
        process.env.OUTBOX_MAX_ATTEMPTS,
        DEFAULT_MAX_ATTEMPTS,
      ),
    );
  }

  private readPositiveNumber(
    raw: string | undefined,
    fallback: number,
  ): number {
    const value = Number(raw);

    return Number.isFinite(value) && value > 0 ? value : fallback;
  }

  private messageOf(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}

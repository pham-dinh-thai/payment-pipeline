import { randomUUID } from 'node:crypto';
import { hostname } from 'node:os';
import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OutboxConsumerRegistry } from './outbox-consumer.registry';
import { OutboxEvent } from './outbox-event';
import type { IOutboxRepository } from './repositories/outbox.repository';
import { OUTBOX_REPOSITORY } from './repositories/outbox.repository';

const DEFAULTS = {
  enabled: true,
  batchSize: 50,
  pollIntervalMs: 1000,
  maxAttempts: 10,
  leaseTimeoutMs: 5 * 60 * 1000,
  backoffBaseMs: 1000,
  backoffMaxMs: 5 * 60 * 1000,
  backoffJitterMs: 1000,
} as const;

@Injectable()
export class OutboxRelay
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(OutboxRelay.name);
  private readonly workerId = `${hostname()}:${process.pid}:${randomUUID()}`;

  private readonly enabled: boolean;
  private readonly batchSize: number;
  private readonly pollIntervalMs: number;
  private readonly maxAttempts: number;
  private readonly leaseTimeoutMs: number;
  private readonly backoffBaseMs: number;
  private readonly backoffMaxMs: number;
  private readonly backoffJitterMs: number;

  private timer?: NodeJS.Timeout;
  private running = false;

  public constructor(
    private readonly configService: ConfigService,
    @Inject(OUTBOX_REPOSITORY)
    private readonly repository: IOutboxRepository,
    private readonly consumerRegistry: OutboxConsumerRegistry,
  ) {
    this.enabled = this.getBoolean('OUTBOX_RELAY_ENABLED', DEFAULTS.enabled);
    this.batchSize = this.getPositiveInt(
      'OUTBOX_BATCH_SIZE',
      DEFAULTS.batchSize,
    );
    this.pollIntervalMs = this.getPositiveInt(
      'OUTBOX_POLL_INTERVAL_MS',
      DEFAULTS.pollIntervalMs,
    );
    this.maxAttempts = this.getPositiveInt(
      'OUTBOX_MAX_ATTEMPTS',
      DEFAULTS.maxAttempts,
    );
    this.leaseTimeoutMs = this.getPositiveInt(
      'OUTBOX_LEASE_TIMEOUT_MS',
      DEFAULTS.leaseTimeoutMs,
    );
    this.backoffBaseMs = this.getPositiveInt(
      'OUTBOX_BACKOFF_BASE_MS',
      DEFAULTS.backoffBaseMs,
    );
    this.backoffMaxMs = this.getPositiveInt(
      'OUTBOX_BACKOFF_MAX_MS',
      DEFAULTS.backoffMaxMs,
    );
    this.backoffJitterMs = this.getNonNegativeInt(
      'OUTBOX_BACKOFF_JITTER_MS',
      DEFAULTS.backoffJitterMs,
    );
  }

  public onApplicationBootstrap(): void {
    if (!this.enabled) {
      this.logger.log('Outbox relay is disabled');
      return;
    }

    this.timer = setInterval(() => {
      void this.runOnce();
    }, this.pollIntervalMs);
    this.timer.unref();

    this.logger.log(
      `Outbox relay started (worker=${this.workerId}, batch=${this.batchSize}, poll=${this.pollIntervalMs}ms)`,
    );

    void this.runOnce();
  }

  public onApplicationShutdown(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  /**
   * Processes one poll cycle. Public so tests can drive the relay
   * deterministically instead of waiting for the interval.
   */
  public async runOnce(): Promise<void> {
    if (!this.enabled || this.running) {
      return;
    }

    this.running = true;

    try {
      await this.releaseStaleEvents();
      await this.drain();
    } catch (error) {
      this.logger.error(
        `Outbox relay cycle failed: ${this.describeError(error)}`,
      );
    } finally {
      this.running = false;
    }
  }

  private async releaseStaleEvents(): Promise<void> {
    const lockedBefore = new Date(Date.now() - this.leaseTimeoutMs);
    const released = await this.repository.releaseStale(lockedBefore);

    if (released > 0) {
      this.logger.warn(
        `Released ${released} stale outbox event(s) locked before ${lockedBefore.toISOString()}`,
      );
    }
  }

  private async drain(): Promise<void> {
    for (;;) {
      const events = await this.repository.claimBatch(
        this.batchSize,
        this.workerId,
      );

      if (events.length === 0) {
        return;
      }

      for (const event of events) {
        await this.processEvent(event);
      }

      if (events.length < this.batchSize) {
        return;
      }
    }
  }

  private async processEvent(event: OutboxEvent): Promise<void> {
    const consumer = this.consumerRegistry.get(event.eventType);

    if (!consumer) {
      await this.handleFailure(
        event,
        new Error(
          `No outbox consumer registered for event type "${event.eventType}"`,
        ),
      );
      return;
    }

    try {
      await consumer.handle(event);
    } catch (error) {
      await this.handleFailure(event, error);
      return;
    }

    const marked = await this.repository.markProcessed(event.id, this.workerId);

    if (!marked) {
      this.logger.warn(
        `Outbox event ${event.id} (${event.eventType}) was processed but its lease was lost`,
      );
    }
  }

  private async handleFailure(
    event: OutboxEvent,
    error: unknown,
  ): Promise<void> {
    const message = this.describeError(error);

    if (event.attempts >= this.maxAttempts) {
      const marked = await this.repository.markFailed(
        event.id,
        this.workerId,
        message,
      );

      this.logger.error(
        `Outbox event ${event.id} (${event.eventType}) moved to failed after ${event.attempts} attempt(s)${marked ? '' : ' (lease lost)'}: ${message}`,
      );
      return;
    }

    const delayMs = this.backoffDelay(event.attempts);
    const rescheduled = await this.repository.reschedule(
      event.id,
      this.workerId,
      delayMs,
      message,
    );

    this.logger.warn(
      `Outbox event ${event.id} (${event.eventType}) failed on attempt ${event.attempts}, retrying in ${delayMs}ms${rescheduled ? '' : ' (lease lost)'}: ${message}`,
    );
  }

  private backoffDelay(attempts: number): number {
    const exponential = this.backoffBaseMs * 2 ** Math.max(0, attempts - 1);
    const capped = Math.min(this.backoffMaxMs, exponential);

    if (this.backoffJitterMs === 0) {
      return capped;
    }

    const jitter = Math.floor(
      Math.random() * Math.min(this.backoffJitterMs, capped),
    );

    return capped + jitter;
  }

  private describeError(error: unknown): string {
    if (error instanceof Error) {
      return error.stack ?? error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }

  private getBoolean(key: string, fallback: boolean): boolean {
    const raw = this.configService.get<string | boolean>(key);

    if (raw === undefined || raw === null || raw === '') {
      return fallback;
    }

    return ['1', 'true', 'yes', 'on'].includes(String(raw).toLowerCase());
  }

  private getPositiveInt(key: string, fallback: number): number {
    const value = this.getNonNegativeInt(key, fallback);

    return value > 0 ? value : fallback;
  }

  private getNonNegativeInt(key: string, fallback: number): number {
    const raw = this.configService.get<string | number>(key);

    if (raw === undefined || raw === null || raw === '') {
      return fallback;
    }

    const value = Number(raw);

    return Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback;
  }
}

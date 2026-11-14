import { Injectable, OnModuleInit } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { type OutboxConsumer } from '../../../../shared/modules/outbox/domain/outbox-consumer';
import { type OutboxEvent } from '../../../../shared/modules/outbox/domain/outbox.repository';
import { OutboxConsumerRegistry } from '../../../../shared/modules/outbox/application/outbox-consumer.registry';
import { ActorType } from '../../domain/enums/actor-type.enum';
import { AuditStatus } from '../../domain/enums/audit-status.enum';
import { type AuditEventPayload } from '../../domain/events/audit-event.payload';
import { RecordAuditLogCommand } from '../commands/record-audit-log/record-audit-log.command';
import { AUDITED_EVENT_TYPES, auditActionOf } from './audited-event-types';

@Injectable()
export class AuditLogConsumer implements OutboxConsumer, OnModuleInit {
  public constructor(
    private readonly registry: OutboxConsumerRegistry,
    private readonly commandBus: CommandBus,
  ) {}

  public onModuleInit(): void {
    for (const eventType of AUDITED_EVENT_TYPES) {
      this.registry.register(eventType, this);
    }
  }

  public async handle(event: OutboxEvent): Promise<void> {
    const { headers, audit } = event.payload as AuditEventPayload;
    const action = auditActionOf(event.eventType);

    if (!action) {
      throw new Error(
        `Missing audit action for event type "${event.eventType}"`,
      );
    }

    await this.commandBus.execute(
      new RecordAuditLogCommand({
        occurredAt: event.createdAt,
        actorId: headers.actorId,
        actorType:
          headers.actorType === 'user' ? ActorType.USER : ActorType.SYSTEM,
        actorLabel: headers.actorLabel,
        action,
        entityType: audit.entityType,
        entityId: audit.entityId,
        status: AuditStatus.SUCCESS,
        before: audit.before ?? null,
        after: audit.after ?? null,
        metadata: { ...audit.metadata, sourceEventId: event.id },
        reason: audit.reason ?? null,
        ipAddress: headers.userIp,
        userAgent: headers.userAgent,
      }),
    );
  }
}

import { Injectable, OnModuleInit } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { type OutboxConsumer } from '../../../../shared/modules/outbox/domain/outbox-consumer';
import { type OutboxEvent } from '../../../../shared/modules/outbox/domain/outbox.repository';
import { OutboxConsumerRegistry } from '../../../../shared/modules/outbox/application/outbox-consumer.registry';
import { type CreateAuditLogProps } from '../../domain/audit-log.aggregate';
import { ActorType } from '../../domain/enums/actor-type.enum';
import { AuditStatus } from '../../domain/enums/audit-status.enum';
import { EntityType } from '../../domain/enums/entity-type.enum';
import { RecordAuditLogCommand } from '../commands/record-audit-log/record-audit-log.command';
import { type RoleEventPayload } from '../../../authorization/domain/events/role-event.payload';
import { ROLE_CREATED_EVENT } from '../../../authorization/domain/events/role-created.event';
import { PERMISSION_GRANTED_EVENT } from '../../../authorization/domain/events/permission-granted.event';
import { ROLE_RENAMED_EVENT } from '../../../authorization/domain/events/role-renamed.event';
import { ROLE_REVOKED_EVENT } from '../../../authorization/domain/events/role-revoked.event';
import { SUPER_ADMIN_SET_EVENT } from '../../../authorization/domain/events/super-admin-set.event';

@Injectable()
export class AuditLogConsumer implements OutboxConsumer, OnModuleInit {
  // Adding a new audited event means adding one line here.
  private readonly mappers = new Map<string, AuditMapper>([
    [ROLE_CREATED_EVENT, roleAudit(ROLE_CREATED_EVENT)],
    [PERMISSION_GRANTED_EVENT, roleAudit(PERMISSION_GRANTED_EVENT)],
    [ROLE_RENAMED_EVENT, roleAudit(ROLE_RENAMED_EVENT)],
    [ROLE_REVOKED_EVENT, roleAudit(ROLE_REVOKED_EVENT)],
    [SUPER_ADMIN_SET_EVENT, roleAudit(SUPER_ADMIN_SET_EVENT)],
  ]);

  public constructor(
    private readonly registry: OutboxConsumerRegistry,
    private readonly commandBus: CommandBus,
  ) {}

  public onModuleInit(): void {
    for (const eventType of this.mappers.keys()) {
      this.registry.register(eventType, this);
    }
  }

  public async handle(event: OutboxEvent): Promise<void> {
    const mapper = this.mappers.get(event.eventType);

    if (!mapper) {
      throw new Error(
        `No audit mapping registered for outbox event "${event.eventType}"`,
      );
    }

    await this.commandBus.execute(
      new RecordAuditLogCommand(mapper(event.payload, event)),
    );
  }
}

type AuditMapper = (
  payload: unknown,
  event: OutboxEvent,
) => CreateAuditLogProps;

const roleAudit =
  (action: string): AuditMapper =>
  (payload, event) => {
    const { headers, role } = payload as RoleEventPayload;

    return {
      occurredAt: event.createdAt,
      actorId: headers.actorId,
      actorType:
        headers.actorType === 'user' ? ActorType.USER : ActorType.SYSTEM,
      actorLabel: headers.actorLabel,
      action,
      entityType: EntityType.ROLES,
      entityId: role.id,
      status: AuditStatus.SUCCESS,
      after: {
        name: role.name,
        permissions: role.permissions,
        isSuperAdmin: role.isSuperAdmin,
      },
      metadata: { sourceEventId: event.id },
      ipAddress: headers.userIp,
      userAgent: headers.userAgent,
    };
  };

import {
  Entity,
  Enum,
  Index,
  PrimaryKey,
  Property,
} from '@mikro-orm/decorators/legacy';
import { ActorType } from '../../domain/enums/actor-type.enum';
import { AuditStatus } from '../../domain/enums/audit-status.enum';
import { EntityType } from '../../domain/enums/entity-type.enum';

@Entity({ tableName: 'audit_logs' })
@Index({
  name: 'audit_logs_entity_idx',
  properties: ['entityType', 'entityId'],
})
@Index({ name: 'audit_logs_actor_idx', properties: ['actorId'] })
@Index({ name: 'audit_logs_occurred_at_idx', properties: ['occurredAt'] })
export class MikroAuditLog {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({
    fieldName: 'occurred_at',
    type: 'timestamptz',
    onCreate: () => new Date(),
  })
  occurredAt = new Date();

  @Property({ fieldName: 'actor_id', type: 'uuid', nullable: true })
  actorId!: string | null;

  @Enum(() => ActorType)
  actorType!: ActorType;

  @Property({
    fieldName: 'actor_label',
    type: 'string',
    length: 255,
    nullable: true,
  })
  actorLabel!: string | null;

  @Property({ type: 'string', length: 100 })
  action!: string;

  @Enum({ items: () => EntityType, nullable: true })
  entityType!: EntityType | null;

  @Property({
    fieldName: 'entity_id',
    type: 'string',
    length: 255,
    nullable: true,
  })
  entityId!: string | null;

  @Enum(() => AuditStatus)
  status!: AuditStatus;

  @Property({ type: 'jsonb', nullable: true })
  before!: Record<string, unknown> | null;

  @Property({ type: 'jsonb', nullable: true })
  after!: Record<string, unknown> | null;

  @Property({ type: 'jsonb', defaultRaw: "'{}'::jsonb" })
  metadata: Record<string, unknown> = {};

  @Property({
    fieldName: 'ip_address',
    type: 'string',
    length: 45,
    nullable: true,
  })
  ipAddress!: string | null;

  @Property({
    fieldName: 'user_agent',
    type: 'string',
    length: 512,
    nullable: true,
  })
  userAgent!: string | null;

  @Property({
    fieldName: 'request_id',
    type: 'string',
    length: 100,
    nullable: true,
  })
  requestId!: string | null;

  @Property({ type: 'string', length: 1000, nullable: true })
  reason!: string | null;

  @Property({
    fieldName: 'error_code',
    type: 'string',
    length: 100,
    nullable: true,
  })
  errorCode!: string | null;

  @Property({
    fieldName: 'error_message',
    type: 'string',
    length: 2000,
    nullable: true,
  })
  errorMessage!: string | null;
}

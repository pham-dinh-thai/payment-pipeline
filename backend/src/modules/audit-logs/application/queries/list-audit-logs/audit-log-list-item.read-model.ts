import { AuditLog } from '../../../domain/audit-log.aggregate';
import { ActorType } from '../../../domain/enums/actor-type.enum';
import { AuditStatus } from '../../../domain/enums/audit-status.enum';
import { EntityType } from '../../../domain/enums/entity-type.enum';

export class AuditLogListItemReadModel {
  public constructor(
    public readonly id: string,
    public readonly occurredAt: Date,
    public readonly actorId: string | null,
    public readonly actorType: ActorType,
    public readonly actorLabel: string | null,
    public readonly action: string,
    public readonly entityType: EntityType | null,
    public readonly entityId: string | null,
    public readonly status: AuditStatus,
    public readonly reason: string | null,
    public readonly errorCode: string | null,
    public readonly errorMessage: string | null,
  ) {}

  public static fromAuditLog(auditLog: AuditLog): AuditLogListItemReadModel {
    return new AuditLogListItemReadModel(
      auditLog.getId(),
      auditLog.getOccurredAt(),
      auditLog.getActorId(),
      auditLog.getActorType(),
      auditLog.getActorLabel(),
      auditLog.getAction(),
      auditLog.getEntityType(),
      auditLog.getEntityId(),
      auditLog.getStatus(),
      auditLog.getReason(),
      auditLog.getErrorCode(),
      auditLog.getErrorMessage(),
    );
  }
}

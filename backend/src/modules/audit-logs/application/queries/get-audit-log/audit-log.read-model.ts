import { AuditLog, AuditSnapshot } from '../../../domain/audit-log.aggregate';
import { ActorType } from '../../../domain/enums/actor-type.enum';
import { AuditStatus } from '../../../domain/enums/audit-status.enum';
import { EntityType } from '../../../domain/enums/entity-type.enum';

export class AuditLogReadModel {
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
    public readonly before: AuditSnapshot | null,
    public readonly after: AuditSnapshot | null,
    public readonly metadata: AuditSnapshot,
    public readonly ipAddress: string | null,
    public readonly userAgent: string | null,
    public readonly requestId: string | null,
    public readonly reason: string | null,
    public readonly errorCode: string | null,
    public readonly errorMessage: string | null,
  ) {}

  public static fromAuditLog(auditLog: AuditLog): AuditLogReadModel {
    return new AuditLogReadModel(
      auditLog.getId(),
      auditLog.getOccurredAt(),
      auditLog.getActorId(),
      auditLog.getActorType(),
      auditLog.getActorLabel(),
      auditLog.getAction(),
      auditLog.getEntityType(),
      auditLog.getEntityId(),
      auditLog.getStatus(),
      auditLog.getBefore(),
      auditLog.getAfter(),
      auditLog.getMetadata(),
      auditLog.getIpAddress(),
      auditLog.getUserAgent(),
      auditLog.getRequestId(),
      auditLog.getReason(),
      auditLog.getErrorCode(),
      auditLog.getErrorMessage(),
    );
  }
}

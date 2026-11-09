import { AuditLog } from '../../domain/audit-log.aggregate';
import { MikroAuditLog } from '../entities/mikro-audit-log.entity';

export class AuditLogMapper {
  public static toDomain(mikroAuditLog: MikroAuditLog): AuditLog {
    return AuditLog.fromPersistent({
      id: mikroAuditLog.id,
      occurredAt: mikroAuditLog.occurredAt,
      actorId: mikroAuditLog.actorId,
      actorType: mikroAuditLog.actorType,
      actorLabel: mikroAuditLog.actorLabel,
      action: mikroAuditLog.action,
      entityType: mikroAuditLog.entityType,
      entityId: mikroAuditLog.entityId,
      status: mikroAuditLog.status,
      before: mikroAuditLog.before,
      after: mikroAuditLog.after,
      metadata: mikroAuditLog.metadata ?? {},
      ipAddress: mikroAuditLog.ipAddress,
      userAgent: mikroAuditLog.userAgent,
      requestId: mikroAuditLog.requestId,
      reason: mikroAuditLog.reason,
      errorCode: mikroAuditLog.errorCode,
      errorMessage: mikroAuditLog.errorMessage,
    });
  }

  public static toMikroOrm(auditLog: AuditLog): MikroAuditLog {
    const mikroAuditLog = new MikroAuditLog();

    AuditLogMapper.assign(mikroAuditLog, auditLog);

    return mikroAuditLog;
  }

  public static assign(mikroAuditLog: MikroAuditLog, auditLog: AuditLog): void {
    mikroAuditLog.id = auditLog.getId();
    mikroAuditLog.occurredAt = auditLog.getOccurredAt();
    mikroAuditLog.actorId = auditLog.getActorId();
    mikroAuditLog.actorType = auditLog.getActorType();
    mikroAuditLog.actorLabel = auditLog.getActorLabel();
    mikroAuditLog.action = auditLog.getAction();
    mikroAuditLog.entityType = auditLog.getEntityType();
    mikroAuditLog.entityId = auditLog.getEntityId();
    mikroAuditLog.status = auditLog.getStatus();
    mikroAuditLog.before = auditLog.getBefore();
    mikroAuditLog.after = auditLog.getAfter();
    mikroAuditLog.metadata = auditLog.getMetadata();
    mikroAuditLog.ipAddress = auditLog.getIpAddress();
    mikroAuditLog.userAgent = auditLog.getUserAgent();
    mikroAuditLog.requestId = auditLog.getRequestId();
    mikroAuditLog.reason = auditLog.getReason();
    mikroAuditLog.errorCode = auditLog.getErrorCode();
    mikroAuditLog.errorMessage = auditLog.getErrorMessage();
  }
}

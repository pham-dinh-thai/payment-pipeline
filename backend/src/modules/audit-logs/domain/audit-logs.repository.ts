import { AuditLog } from './audit-log.aggregate';
import { EntityType } from './enums/entity-type.enum';

export interface IAuditLogsRepository {
  findById(id: string): Promise<AuditLog | null>;

  findByEntity(entityType: EntityType, entityId: string): Promise<AuditLog[]>;

  create(auditLog: AuditLog): Promise<AuditLog>;
}

export const AUDIT_LOGS_REPOSITORY = 'IAuditLogsRepository';

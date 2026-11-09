import { AuditLog } from './audit-log.aggregate';
import { ActorType } from './enums/actor-type.enum';
import { AuditStatus } from './enums/audit-status.enum';
import { EntityType } from './enums/entity-type.enum';

export type FindAuditLogsOptions = {
  actorId?: string;
  actorType?: ActorType;
  action?: string;
  entityType?: EntityType;
  entityId?: string;
  status?: AuditStatus;
  from?: Date;
  to?: Date;
  limit: number;
  offset: number;
};

export type AuditLogPage = {
  items: AuditLog[];
  total: number;
};

export interface IAuditLogsRepository {
  findById(id: string): Promise<AuditLog | null>;

  findByEntity(entityType: EntityType, entityId: string): Promise<AuditLog[]>;

  findPage(options: FindAuditLogsOptions): Promise<AuditLogPage>;

  create(auditLog: AuditLog): Promise<AuditLog>;
}

export const AUDIT_LOGS_REPOSITORY = 'IAuditLogsRepository';

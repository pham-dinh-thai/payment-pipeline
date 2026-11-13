import { type ActorHeaders } from '../../../../shared/types/actor-headers';
import { type AuditSnapshot } from '../audit-log.aggregate';
import { EntityType } from '../enums/entity-type.enum';

/**
 * Audit-specific part of an outbox event. Kept separate from any business
 * payload so the audit consumer never needs to know the shape of each event.
 */
export type AuditData = {
  entityType: EntityType;
  entityId: string;
  before?: AuditSnapshot | null;
  after?: AuditSnapshot | null;
  metadata?: AuditSnapshot;
  reason?: string | null;
};

export type AuditEventPayload = {
  headers: ActorHeaders;
  audit: AuditData;
};

export const auditEventPayload = (
  headers: ActorHeaders,
  audit: AuditData,
): AuditEventPayload => ({ headers, audit });

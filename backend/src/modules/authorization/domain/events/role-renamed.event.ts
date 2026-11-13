import type { AuditEventPayload } from '../../../audit-logs/domain/events/audit-event.payload';

export const ROLE_RENAMED_EVENT = 'role.renamed';

export type RoleRenamedPayload = AuditEventPayload;

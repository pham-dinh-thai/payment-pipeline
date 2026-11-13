import type { AuditEventPayload } from '../../../audit-logs/domain/events/audit-event.payload';

export const ROLE_REVOKED_EVENT = 'role.revoked';

export type RoleRevokedPayload = AuditEventPayload;

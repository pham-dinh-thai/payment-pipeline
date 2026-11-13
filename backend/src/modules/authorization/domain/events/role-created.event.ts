import type { AuditEventPayload } from '../../../audit-logs/domain/events/audit-event.payload';

export const ROLE_CREATED_EVENT = 'role.created';

export type RoleCreatedPayload = AuditEventPayload;

import type { AuditEventPayload } from '../../../audit-logs/domain/events/audit-event.payload';

export const USER_ROLE_REMOVED_EVENT = 'user.role_removed';

export type UserRoleRemovedPayload = AuditEventPayload;

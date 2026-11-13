import type { AuditEventPayload } from '../../../audit-logs/domain/events/audit-event.payload';

export const USER_ROLE_ASSIGNED_EVENT = 'user.role_assigned';

export type UserRoleAssignedPayload = AuditEventPayload;

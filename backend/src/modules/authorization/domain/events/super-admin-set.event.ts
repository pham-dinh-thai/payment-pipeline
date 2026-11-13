import type { AuditEventPayload } from '../../../audit-logs/domain/events/audit-event.payload';

export const SUPER_ADMIN_SET_EVENT = 'role.super_admin_set';

export type SuperAdminSetPayload = AuditEventPayload;

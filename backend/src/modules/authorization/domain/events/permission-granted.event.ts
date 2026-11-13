import type { AuditEventPayload } from '../../../audit-logs/domain/events/audit-event.payload';

export const PERMISSION_GRANTED_EVENT = 'role.permission_granted';

export type PermissionGrantedPayload = AuditEventPayload;

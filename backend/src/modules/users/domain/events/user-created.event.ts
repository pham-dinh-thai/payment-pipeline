import type { AuditEventPayload } from '../../../audit-logs/domain/events/audit-event.payload';

export const USER_CREATED_EVENT = 'user.created';

export type UserCreatedPayload = AuditEventPayload;

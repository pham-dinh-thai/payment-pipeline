import type { AuditEventPayload } from '../../../audit-logs/domain/events/audit-event.payload';

export const USER_EMAIL_CHANGED_EVENT = 'user.email_changed';

export type UserEmailChangedPayload = AuditEventPayload;

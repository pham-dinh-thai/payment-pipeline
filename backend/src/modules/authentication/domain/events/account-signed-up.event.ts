import type { AuditEventPayload } from '../../../audit-logs/domain/events/audit-event.payload';

export const ACCOUNT_SIGNED_UP_EVENT = 'account.signed-up';

export type AccountSignedUpPayload = AuditEventPayload;

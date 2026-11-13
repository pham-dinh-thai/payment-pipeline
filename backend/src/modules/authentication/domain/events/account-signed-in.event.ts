import type { AuditEventPayload } from '../../../audit-logs/domain/events/audit-event.payload';

export const ACCOUNT_SIGNED_IN_EVENT = 'account.signed-in';

export type AccountSignedInPayload = AuditEventPayload;

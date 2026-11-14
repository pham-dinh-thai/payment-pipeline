import type { AuditEventPayload } from '../../../audit-logs/domain/events/audit-event.payload';

export const EXPENSE_CREATED_EVENT = 'expense.created';

export type ExpenseCreatedPayload = AuditEventPayload;

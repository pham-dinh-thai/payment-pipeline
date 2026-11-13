import type { AuditEventPayload } from '../../../audit-logs/domain/events/audit-event.payload';

export const SUPPLIER_CREATED_EVENT = 'supplier.created';

export type SupplierCreatedPayload = AuditEventPayload;

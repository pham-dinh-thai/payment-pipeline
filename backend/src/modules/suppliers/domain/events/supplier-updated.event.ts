import type { AuditEventPayload } from '../../../audit-logs/domain/events/audit-event.payload';

export const SUPPLIER_UPDATED_EVENT = 'supplier.updated';

export type SupplierUpdatedPayload = AuditEventPayload;

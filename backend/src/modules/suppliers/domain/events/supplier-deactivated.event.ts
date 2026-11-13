import type { AuditEventPayload } from '../../../audit-logs/domain/events/audit-event.payload';

export const SUPPLIER_DEACTIVATED_EVENT = 'supplier.deactivated';

export type SupplierDeactivatedPayload = AuditEventPayload;

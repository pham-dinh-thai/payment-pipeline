import type { AuditEventPayload } from '../../../audit-logs/domain/events/audit-event.payload';

export const INVENTORY_STOCK_ISSUED_EVENT = 'inventory.stock_issued';

export type InventoryStockIssuedPayload = AuditEventPayload;

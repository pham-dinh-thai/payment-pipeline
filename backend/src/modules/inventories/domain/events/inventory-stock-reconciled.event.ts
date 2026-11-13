import type { AuditEventPayload } from '../../../audit-logs/domain/events/audit-event.payload';

export const INVENTORY_STOCK_RECONCILED_EVENT = 'inventory.stock_reconciled';

export type InventoryStockReconciledPayload = AuditEventPayload;

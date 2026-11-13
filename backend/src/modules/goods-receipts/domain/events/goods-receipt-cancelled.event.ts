import type { AuditEventPayload } from '../../../audit-logs/domain/events/audit-event.payload';

export const GOODS_RECEIPT_CANCELLED_EVENT = 'goods_receipt.cancelled';

export type GoodsReceiptCancelledPayload = AuditEventPayload;

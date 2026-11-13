import type { AuditEventPayload } from '../../../audit-logs/domain/events/audit-event.payload';

export const GOODS_RECEIPT_CONFIRMED_EVENT = 'goods_receipt.confirmed';

export type GoodsReceiptConfirmedPayload = AuditEventPayload;

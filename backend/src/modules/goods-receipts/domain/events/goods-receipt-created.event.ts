import type { AuditEventPayload } from '../../../audit-logs/domain/events/audit-event.payload';

export const GOODS_RECEIPT_CREATED_EVENT = 'goods_receipt.created';

export type GoodsReceiptCreatedPayload = AuditEventPayload;

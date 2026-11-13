import type { AuditEventPayload } from '../../../audit-logs/domain/events/audit-event.payload';

/**
 * Both events are emitted in the same transaction when a goods receipt is
 * confirmed. They stay separate event types because the outbox registry maps
 * one consumer per event type: the audit consumer and the inventory consumer
 * must not overwrite each other, and each can be retried independently.
 */
export const GOODS_RECEIPT_CONFIRMED_EVENT = 'goods_receipt.confirmed.audit';

export const GOODS_RECEIPT_STOCK_RECEIVED_EVENT =
  'goods_receipt.confirmed.stock_received';

export type GoodsReceiptConfirmedPayload = AuditEventPayload;

export type GoodsReceiptStockReceivedLine = {
  batchId: string;
  productId: string;
  lotNumber: string;
  quantity: number;
  unitCost: string;
  expiresAt: string;
};

export type GoodsReceiptStockReceivedPayload = {
  goodsReceiptId: string;
  confirmedBy: string;
  lines: GoodsReceiptStockReceivedLine[];
};

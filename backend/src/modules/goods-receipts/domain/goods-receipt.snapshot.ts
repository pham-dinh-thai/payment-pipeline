import { GoodsReceipt } from './goods-receipt.aggregate';
import { GoodsReceiptLine } from './goods-receipt-line.entity';

const lineSnapshot = (line: GoodsReceiptLine) => ({
  id: line.getId(),
  lotNumber: line.getLotNumber(),
  productId: line.getProductId(),
  quantity: line.getQuantity(),
  unitCost: line.getUnitCost(),
  expiresAt: line.getExpiresAt().toISOString(),
  batchId: line.getBatchId(),
});

/**
 * Snapshot of a goods receipt for audit logging. Handlers decide which parts
 * (before/after) end up in the audit envelope.
 */
export const goodsReceiptSnapshot = (goodsReceipt: GoodsReceipt) => ({
  code: goodsReceipt.getCode(),
  supplierId: goodsReceipt.getSupplierId(),
  status: goodsReceipt.getStatus(),
  createdBy: goodsReceipt.getCreatedBy(),
  confirmedBy: goodsReceipt.getConfirmedBy(),
  confirmedAt: goodsReceipt.getConfirmedAt()?.toISOString() ?? null,
  cancelledBy: goodsReceipt.getCancelledBy(),
  cancelledAt: goodsReceipt.getCancelledAt()?.toISOString() ?? null,
  lines: goodsReceipt.getGoodsReceiptLines().map(lineSnapshot),
});

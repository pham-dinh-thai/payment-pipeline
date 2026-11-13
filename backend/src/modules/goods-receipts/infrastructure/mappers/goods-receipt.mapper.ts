import { GoodsReceipt } from '../../domain/goods-receipt.aggregate';
import { GoodsReceiptLine } from '../../domain/goods-receipt-line.entity';
import { MikroGoodsReceipt } from '../entities/mikro-goods-receipt.entity';
import { MikroGoodsReceiptLine } from '../entities/mikro-goods-receipt-line.entity';

export class GoodsReceiptMapper {
  public static toDomain(
    mikroGoodsReceipt: MikroGoodsReceipt,
    mikroLines: MikroGoodsReceiptLine[],
  ): GoodsReceipt {
    return GoodsReceipt.fromPersistent({
      id: mikroGoodsReceipt.id,
      code: mikroGoodsReceipt.code,
      supplierId: mikroGoodsReceipt.supplierId,
      goodsReceiptLines: mikroLines.map((mikroLine) =>
        GoodsReceiptMapper.toLineDomain(mikroLine),
      ),
      status: mikroGoodsReceipt.status,
      createdBy: mikroGoodsReceipt.createdBy,
      confirmedBy: mikroGoodsReceipt.confirmedBy,
      confirmedAt: mikroGoodsReceipt.confirmedAt,
      cancelledBy: mikroGoodsReceipt.cancelledBy,
      cancelledAt: mikroGoodsReceipt.cancelledAt,
      createdAt: mikroGoodsReceipt.createdAt,
      updatedAt: mikroGoodsReceipt.updatedAt,
    });
  }

  public static toMikro(goodsReceipt: GoodsReceipt): {
    goodsReceipt: MikroGoodsReceipt;
    lines: MikroGoodsReceiptLine[];
  } {
    const mikroGoodsReceipt = new MikroGoodsReceipt();

    mikroGoodsReceipt.id = goodsReceipt.getId();
    mikroGoodsReceipt.code = goodsReceipt.getCode();
    mikroGoodsReceipt.supplierId = goodsReceipt.getSupplierId();
    mikroGoodsReceipt.status = goodsReceipt.getStatus();
    mikroGoodsReceipt.createdBy = goodsReceipt.getCreatedBy();
    mikroGoodsReceipt.confirmedBy = goodsReceipt.getConfirmedBy();
    mikroGoodsReceipt.confirmedAt = goodsReceipt.getConfirmedAt();
    mikroGoodsReceipt.cancelledBy = goodsReceipt.getCancelledBy();
    mikroGoodsReceipt.cancelledAt = goodsReceipt.getCancelledAt();
    mikroGoodsReceipt.createdAt = goodsReceipt.getCreatedAt();
    mikroGoodsReceipt.updatedAt = goodsReceipt.getUpdatedAt();

    return {
      goodsReceipt: mikroGoodsReceipt,
      lines: goodsReceipt
        .getGoodsReceiptLines()
        .map((line) =>
          GoodsReceiptMapper.toLineMikro(line, goodsReceipt.getId()),
        ),
    };
  }

  private static toLineDomain(
    mikroLine: MikroGoodsReceiptLine,
  ): GoodsReceiptLine {
    return GoodsReceiptLine.fromPersistent({
      id: mikroLine.id,
      lotNumber: mikroLine.lotNumber,
      productId: mikroLine.productId,
      unitCost: mikroLine.unitCost,
      quantity: mikroLine.quantity,
      expiresAt: new Date(mikroLine.expiresAt),
      batchId: mikroLine.batchId,
      createdAt: mikroLine.createdAt,
      updatedAt: mikroLine.updatedAt,
    });
  }

  private static toLineMikro(
    line: GoodsReceiptLine,
    goodsReceiptId: string,
  ): MikroGoodsReceiptLine {
    const mikroLine = new MikroGoodsReceiptLine();

    mikroLine.id = line.getId();
    mikroLine.goodsReceiptId = goodsReceiptId;
    mikroLine.productId = line.getProductId();
    mikroLine.lotNumber = line.getLotNumber();
    mikroLine.quantity = line.getQuantity();
    mikroLine.unitCost = line.getUnitCost();
    mikroLine.expiresAt = line.getExpiresAt();
    mikroLine.batchId = line.getBatchId();
    mikroLine.createdAt = line.getCreatedAt();
    mikroLine.updatedAt = line.getUpdatedAt();

    return mikroLine;
  }
}

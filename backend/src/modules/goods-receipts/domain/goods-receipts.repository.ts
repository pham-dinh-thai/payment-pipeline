import { GoodsReceipt } from './goods-receipt.aggregate';

export type FindGoodsReceiptOptions = {
  forUpdate?: boolean;
};

export interface IGoodsReceiptsRepository {
  nextSequence(): Promise<number>;

  findById(
    id: string,
    options?: FindGoodsReceiptOptions,
  ): Promise<GoodsReceipt | null>;

  create(goodsReceipt: GoodsReceipt): Promise<GoodsReceipt>;

  update(goodsReceipt: GoodsReceipt): Promise<GoodsReceipt>;
}

export const GOODS_RECEIPTS_REPOSITORY = 'IGoodsReceiptsRepository';

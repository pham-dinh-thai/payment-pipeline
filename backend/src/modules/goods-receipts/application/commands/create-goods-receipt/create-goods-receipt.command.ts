import { Command } from '@nestjs/cqrs';

export type CreateGoodsReceiptLineProps = {
  lotNumber: string;
  productId: string;
  quantity: number;
  unitCost: string;
  expiresAt: Date;
};

export class CreateGoodsReceiptCommand extends Command<{
  id: string;
  code: string;
}> {
  public constructor(
    public readonly supplierId: string,
    public readonly lines: CreateGoodsReceiptLineProps[],
    public readonly createdBy: string,
  ) {
    super();
  }
}

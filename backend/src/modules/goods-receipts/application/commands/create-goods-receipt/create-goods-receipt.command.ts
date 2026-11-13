import { Command } from '@nestjs/cqrs';
import { type ActorHeaders } from '../../../../../shared/types/actor-headers';

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
    public readonly headers: ActorHeaders,
  ) {
    super();
  }
}

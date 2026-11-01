import { IsInt, Min } from 'class-validator';

export class ReceiveBatchStockRequest {
  @IsInt()
  @Min(1)
  quantity!: number;
}

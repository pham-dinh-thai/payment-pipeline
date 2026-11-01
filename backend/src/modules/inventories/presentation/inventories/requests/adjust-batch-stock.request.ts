import { IsInt, NotEquals } from 'class-validator';

export class AdjustBatchStockRequest {
  @IsInt()
  @NotEquals(0)
  delta!: number;
}

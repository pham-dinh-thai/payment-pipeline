import { IsInt, IsNotEmpty } from 'class-validator';

export class AdjustBatchStockRequest {
  @IsInt()
  @IsNotEmpty()
  delta!: number;
}

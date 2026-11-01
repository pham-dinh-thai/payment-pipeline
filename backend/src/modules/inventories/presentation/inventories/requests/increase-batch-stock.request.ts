import { IsInt, Min } from 'class-validator';

export class IncreaseBatchStockRequest {
  @IsInt()
  @Min(1)
  quantity!: number;
}

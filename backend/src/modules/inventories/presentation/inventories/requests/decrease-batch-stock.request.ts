import { IsInt, Min } from 'class-validator';

export class DecreaseBatchStockRequest {
  @IsInt()
  @Min(1)
  quantity!: number;
}

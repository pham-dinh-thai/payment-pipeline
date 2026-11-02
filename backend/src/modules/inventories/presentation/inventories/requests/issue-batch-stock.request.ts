import { IsInt, Min } from 'class-validator';

export class IssueBatchStockRequest {
  @IsInt()
  @Min(1)
  quantity!: number;
}

import { IsInt, Min } from 'class-validator';

export class ReconcileBatchStockRequest {
  /** Số lượng đếm thực tế khi kiểm kê, không phải delta. */
  @IsInt()
  @Min(0)
  quantity!: number;
}

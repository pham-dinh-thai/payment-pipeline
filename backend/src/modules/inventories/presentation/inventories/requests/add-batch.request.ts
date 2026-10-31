import { Type } from 'class-transformer';
import {
  IsDate,
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class AddBatchRequest {
  @IsString()
  @IsNotEmpty()
  lotNumber!: string;

  @IsInt()
  @IsNotEmpty()
  quantity!: number;

  @IsDecimal()
  @IsNotEmpty()
  unitCost!: string;

  @Type(() => Date)
  @IsDate()
  expiresAt!: Date;
}

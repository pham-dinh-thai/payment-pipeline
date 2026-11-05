import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class GoodsReceiptLineRequest {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lotNumber!: string;

  @IsUUID('4')
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsDecimal()
  @IsNotEmpty()
  unitCost!: string;

  @Type(() => Date)
  @IsDate()
  expiresAt!: Date;
}

export class CreateGoodsReceiptRequest {
  @IsUUID('4')
  supplierId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GoodsReceiptLineRequest)
  lines!: GoodsReceiptLineRequest[];
}

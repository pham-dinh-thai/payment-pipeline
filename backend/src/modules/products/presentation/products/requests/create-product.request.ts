import { Transform } from 'class-transformer';
import { IsDecimal, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateProductRequest {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsDecimal()
  @IsNotEmpty()
  unitPrice!: string;

  @IsInt()
  @IsNotEmpty()
  quantity!: number;
}

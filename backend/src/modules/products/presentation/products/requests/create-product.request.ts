import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateProductRequest {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Matches(/^\d+$/, { message: 'unitPrice must be an integer in VND' })
  @IsNotEmpty()
  unitPrice!: string;

  @IsInt()
  @IsNotEmpty()
  quantity!: number;
}

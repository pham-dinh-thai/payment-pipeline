import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

const trimToNull = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : null;
};

export class UpdateSupplierRequest {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string | null;

  @Transform(trimToNull)
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string | null;

  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string | null;

  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxCode?: string | null;
}

import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class GrantPermissionRequest {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  permission!: string;
}

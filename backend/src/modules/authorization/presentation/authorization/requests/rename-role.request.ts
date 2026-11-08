import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class RenameRoleRequest {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;
}

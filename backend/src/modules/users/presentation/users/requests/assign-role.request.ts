import { Transform } from 'class-transformer';
import { IsUUID } from 'class-validator';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class AssignRoleRequest {
  @Transform(trim)
  @IsUUID('4')
  roleId!: string;
}

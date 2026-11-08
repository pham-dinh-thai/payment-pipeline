import { IsBoolean } from 'class-validator';

export class SetRoleSuperAdminRequest {
  @IsBoolean()
  isSuperAdmin!: boolean;
}

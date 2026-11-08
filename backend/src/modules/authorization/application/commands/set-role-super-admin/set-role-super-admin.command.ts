import { Command } from '@nestjs/cqrs';

export class SetRoleSuperAdminCommand extends Command<{ id: string }> {
  public constructor(
    public readonly id: string,
    public readonly isSuperAdmin: boolean,
  ) {
    super();
  }
}

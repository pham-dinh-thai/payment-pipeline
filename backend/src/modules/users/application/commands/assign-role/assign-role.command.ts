import { Command } from '@nestjs/cqrs';

export class AssignRoleCommand extends Command<{
  id: string;
  roleIds: string[];
}> {
  public constructor(
    public readonly userId: string,
    public readonly roleId: string,
  ) {
    super();
  }
}

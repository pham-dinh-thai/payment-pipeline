import { Command } from '@nestjs/cqrs';

export class RemoveRoleCommand extends Command<{
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

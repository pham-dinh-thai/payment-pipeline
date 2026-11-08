import { Command } from '@nestjs/cqrs';

export class RenameRoleCommand extends Command<{ id: string }> {
  public constructor(
    public readonly id: string,
    public readonly name: string,
  ) {
    super();
  }
}

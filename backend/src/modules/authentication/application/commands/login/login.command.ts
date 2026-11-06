import { Command } from '@nestjs/cqrs';

export class LoginCommand extends Command<void> {
  public constructor(
    public readonly email: string,
    public readonly password: string,
  ) {
    super();
  }
}

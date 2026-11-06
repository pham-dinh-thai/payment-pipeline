import { Command } from '@nestjs/cqrs';

export class CreateUserCommand extends Command<{ id: string }> {
  public constructor(
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
  ) {
    super();
  }
}

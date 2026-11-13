import { Command } from '@nestjs/cqrs';

export class RegisterCommand extends Command<void> {
  public constructor(
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly password: string,
    public readonly ip: string,
    public readonly userAgent: string,
  ) {
    super();
  }
}

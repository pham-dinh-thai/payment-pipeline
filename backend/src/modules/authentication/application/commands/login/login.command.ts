import { Command } from '@nestjs/cqrs';

export class LoginCommand extends Command<{
  accessToken: string;
  refreshToken: string;
}> {
  public constructor(
    public readonly email: string,
    public readonly password: string,
  ) {
    super();
  }
}

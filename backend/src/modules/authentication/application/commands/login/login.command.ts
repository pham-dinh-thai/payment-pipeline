import { Command } from '@nestjs/cqrs';

export class LoginCommand extends Command<{
  accessToken: string;
  refreshToken: string;
}> {
  public constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly ip: string,
    public readonly userAgent: string,
  ) {
    super();
  }
}

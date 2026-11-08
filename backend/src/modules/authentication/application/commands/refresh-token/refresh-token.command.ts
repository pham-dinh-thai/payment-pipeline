import { Command } from '@nestjs/cqrs';

export class RefreshTokenCommand extends Command<{
  accessToken: string;
  refreshToken: string;
}> {
  public constructor(public readonly refreshToken: string) {
    super();
  }
}

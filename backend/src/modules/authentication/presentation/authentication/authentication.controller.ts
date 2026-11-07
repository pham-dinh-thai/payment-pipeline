import { Body, Controller, Post } from '@nestjs/common';
import { RegisterRequest } from './requests/register.request';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterCommand } from '../../application/commands/register/register.command';
import { LoginRequest } from './requests/login.request';
import { LoginCommand } from '../../application/commands/login/login.command';

@Controller('authentication')
export class AuthenticationController {
  public constructor(private readonly commandBus: CommandBus) {}

  @Post('/register')
  public async register(@Body() request: RegisterRequest): Promise<void> {
    return await this.commandBus.execute(
      new RegisterCommand(
        request.firstName,
        request.lastName,
        request.email,
        request.password,
      ),
    );
  }

  @Post('/login')
  public async login(
    @Body() request: LoginRequest,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return await this.commandBus.execute(
      new LoginCommand(request.email, request.password),
    );
  }
}

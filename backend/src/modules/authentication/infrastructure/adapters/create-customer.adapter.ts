import { Injectable } from '@nestjs/common';
import {
  CreateCustomerRequest,
  ICreateCustomerPort,
} from '../../application/commands/register/ports/create-customer.port';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCustomerCommand } from '../../../customers/application/commands/create-customer/create-customer.command';

@Injectable()
export class CreateCustomerAdapter implements ICreateCustomerPort {
  public constructor(private readonly commandBus: CommandBus) {}

  public async execute(
    request: CreateCustomerRequest,
  ): Promise<{ id: string }> {
    return await this.commandBus.execute(
      new CreateCustomerCommand(request.userId),
    );
  }
}

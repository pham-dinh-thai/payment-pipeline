import { Command } from '@nestjs/cqrs';

export class CreateCustomerCommand extends Command<{ id: string }> {
  public constructor(public readonly userId: string) {
    super();
  }
}

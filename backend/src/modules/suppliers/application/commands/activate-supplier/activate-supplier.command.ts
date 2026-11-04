import { Command } from '@nestjs/cqrs';

export class ActivateSupplierCommand extends Command<{ id: string }> {
  public constructor(public readonly id: string) {
    super();
  }
}

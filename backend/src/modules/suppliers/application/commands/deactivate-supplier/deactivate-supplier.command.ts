import { Command } from '@nestjs/cqrs';

export class DeactivateSupplierCommand extends Command<{ id: string }> {
  public constructor(public readonly id: string) {
    super();
  }
}

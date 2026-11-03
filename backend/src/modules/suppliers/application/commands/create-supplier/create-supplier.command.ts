import { Command } from '@nestjs/cqrs';

export class CreateSupplierCommand extends Command<{ id: string }> {
  public constructor(
    public readonly name: string,
    public phone: string | null,
    public email: string | null,
    public address: string | null,
    public taxCode: string | null,
  ) {
    super();
  }
}

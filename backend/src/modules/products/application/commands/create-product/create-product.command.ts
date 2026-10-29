import { Command } from '@nestjs/cqrs';

export class CreateProductCommand extends Command<{ id: string }> {
  public constructor(
    public readonly name: string,
    public readonly unitPrice: string,
    public readonly quantity: number,
  ) {
    super();
  }
}

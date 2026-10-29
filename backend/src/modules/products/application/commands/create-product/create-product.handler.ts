import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateProductCommand } from './create-product.command';
import {
  type IProductsRepository,
  PRODUCTS_REPOSITORY,
} from '../../../domain/products.repository';
import { Inject } from '@nestjs/common';
import { Product } from '../../../domain/product.aggregate';

@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<CreateProductCommand> {
  public constructor(
    @Inject(PRODUCTS_REPOSITORY)
    private readonly productsRepository: IProductsRepository,
  ) {}

  public async execute(command: CreateProductCommand): Promise<{ id: string }> {
    const product = Product.create({
      name: command.name,
      unitPrice: command.unitPrice,
      quantity: command.quantity,
    });

    await this.productsRepository.create(product);

    return { id: product.getId() };
  }
}

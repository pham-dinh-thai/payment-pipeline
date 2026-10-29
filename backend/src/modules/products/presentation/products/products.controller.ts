import { Body, Controller, Logger, Post } from '@nestjs/common';
import { CreateProductRequest } from './requests/create-product.request';
import { CommandBus } from '@nestjs/cqrs';
import { CreateProductCommand } from '../../application/commands/create-product/create-product.command';

@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  public constructor(private readonly commandBus: CommandBus) {}

  @Post()
  public async create(
    @Body() request: CreateProductRequest,
  ): Promise<{ id: string }> {
    const result = await this.commandBus.execute(
      new CreateProductCommand(
        request.name,
        request.unitPrice,
        request.quantity,
      ),
    );

    this.logger.log('Product created', result);

    return result;
  }
}

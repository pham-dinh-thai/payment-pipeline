import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { CreateProductRequest } from './requests/create-product.request';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateProductCommand } from '../../application/commands/create-product/create-product.command';
import { GetProductsQuery } from '../../application/queries/get-products/get-products.query';
import { ProductListItemReadModel } from '../../application/queries/get-products/product-list-item.read-model';

@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  public constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  public async findAll(): Promise<ProductListItemReadModel[]> {
    return this.queryBus.execute(new GetProductsQuery());
  }

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

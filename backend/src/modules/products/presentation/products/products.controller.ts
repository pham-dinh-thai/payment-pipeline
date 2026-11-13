import { Body, Controller, Get, Logger, Post, UseGuards } from '@nestjs/common';
import { CreateProductRequest } from './requests/create-product.request';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateProductCommand } from '../../application/commands/create-product/create-product.command';
import { GetProductsQuery } from '../../application/queries/get-products/get-products.query';
import { ProductListItemReadModel } from '../../application/queries/get-products/product-list-item.read-model';
import { AuthGuard } from '../../../../shared/modules/security/auth.guard';
import { PermissionsGuard } from '../../../../shared/modules/security/permissions.guard';
import { RequirePermissions } from '../../../../shared/modules/security/require-permissions.decorator';
import { ActorContext } from '../../../../shared/modules/security/actor-context.decorator';
import { type ActorHeaders } from '../../../../shared/types/actor-headers';

@Controller('products')
@UseGuards(AuthGuard, PermissionsGuard)
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  public constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @RequirePermissions(['products:read'])
  public async findAll(): Promise<ProductListItemReadModel[]> {
    return this.queryBus.execute(new GetProductsQuery());
  }

  @Post()
  @RequirePermissions(['products:create'])
  public async create(
    @Body() request: CreateProductRequest,
    @ActorContext() headers: ActorHeaders,
  ): Promise<{ id: string }> {
    const result = await this.commandBus.execute(
      new CreateProductCommand(
        request.name,
        request.unitPrice,
        request.quantity,
        headers,
      ),
    );

    this.logger.log('Product created', result);

    return result;
  }
}

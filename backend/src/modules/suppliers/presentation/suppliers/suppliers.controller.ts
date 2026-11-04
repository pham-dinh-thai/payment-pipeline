import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateSupplierCommand } from '../../application/commands/create-supplier/create-supplier.command';
import { UpdateSupplierCommand } from '../../application/commands/update-supplier/update-supplier.command';
import { UpdateSupplierResponse } from '../../application/commands/update-supplier/update-supplier.response';
import { GetSuppliersQuery } from '../../application/queries/get-suppliers/get-suppliers.query';
import { SupplierListItemReadModel } from '../../application/queries/get-suppliers/supplier-list-item.read-model';
import { CreateSupplierRequest } from './requests/create-supplier.request';
import { UpdateSupplierRequest } from './requests/update-supplier.request';
import { DeactivateSupplierCommand } from '../../application/commands/deactivate-supplier/deactivate-supplier.command';
import { ActivateSupplierCommand } from '../../application/commands/activate-supplier/activate-supplier.command';

@Controller('suppliers')
export class SuppliersController {
  private readonly logger = new Logger(SuppliersController.name);

  public constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  public findAll(): Promise<SupplierListItemReadModel[]> {
    return this.queryBus.execute(new GetSuppliersQuery());
  }

  @Post()
  public create(
    @Body() request: CreateSupplierRequest,
  ): Promise<{ id: string }> {
    const response = this.commandBus.execute(
      new CreateSupplierCommand(
        request.name,
        request.phone ?? null,
        request.email ?? null,
        request.address ?? null,
        request.taxCode ?? null,
      ),
    );

    this.logger.log(`Supplier created`, response);

    return response;
  }

  @Patch(':id')
  public update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() request: UpdateSupplierRequest,
  ): Promise<UpdateSupplierResponse> {
    const response = this.commandBus.execute(
      new UpdateSupplierCommand(
        id,
        request.name,
        request.phone ?? null,
        request.email ?? null,
        request.address ?? null,
        request.taxCode ?? null,
      ),
    );

    this.logger.log(`Supplier ${id} updated`, response);

    return response;
  }

  @Patch(':id/deactivate')
  public deactivate(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ id: string }> {
    const response = this.commandBus.execute(new DeactivateSupplierCommand(id));

    this.logger.log(`Supplier ${id} deactivated`);

    return response;
  }

  @Patch(':id/activate')
  public activate(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ id: string }> {
    const response = this.commandBus.execute(new ActivateSupplierCommand(id));

    this.logger.log(`Supplier ${id} activated`);

    return response;
  }
}

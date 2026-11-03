import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateSupplierCommand } from '../../application/commands/create-supplier/create-supplier.command';
import { UpdateSupplierCommand } from '../../application/commands/update-supplier/update-supplier.command';
import { UpdateSupplierResponse } from '../../application/commands/update-supplier/update-supplier.response';
import { CreateSupplierRequest } from './requests/create-supplier.request';
import { UpdateSupplierRequest } from './requests/update-supplier.request';

@Controller('suppliers')
export class SuppliersController {
  public constructor(private readonly commandBus: CommandBus) {}

  @Post()
  public create(
    @Body() request: CreateSupplierRequest,
  ): Promise<{ id: string }> {
    return this.commandBus.execute(
      new CreateSupplierCommand(
        request.name,
        request.phone ?? null,
        request.email ?? null,
        request.address ?? null,
        request.taxCode ?? null,
      ),
    );
  }

  @Patch(':id')
  public update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() request: UpdateSupplierRequest,
  ): Promise<UpdateSupplierResponse> {
    return this.commandBus.execute(
      new UpdateSupplierCommand(
        id,
        request.name,
        request.phone ?? null,
        request.email ?? null,
        request.address ?? null,
        request.taxCode ?? null,
      ),
    );
  }
}

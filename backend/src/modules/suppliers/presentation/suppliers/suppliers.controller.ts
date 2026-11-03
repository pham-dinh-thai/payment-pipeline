import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateSupplierCommand } from '../../application/commands/create-supplier/create-supplier.command';
import { CreateSupplierRequest } from './requests/create-supplier.request';

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
}

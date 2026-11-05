import {
  Body,
  Controller,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { ReconcileBatchStockRequest } from './requests/reconcile-batch-stock.request';
import { ReconcileBatchStockCommand } from '../../application/commands/reconcile-batch-stock/reconcile-batch-stock.command';
import { IssueBatchStockCommand } from '../../application/commands/issue-batch-stock/issue-batch-stock.command';
import { IssueBatchStockRequest } from './requests/issue-batch-stock.request';
import { CommandBus } from '@nestjs/cqrs';

@Controller('inventories')
export class InventoriesController {
  private readonly logger = new Logger(InventoriesController.name);

  public constructor(private readonly commandBus: CommandBus) {}

  @Patch(':productId/issue/:batchId')
  public async issueBatchStock(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) productId: string,
    @Param('batchId', new ParseUUIDPipe({ version: '4' })) batchId: string,
    @Body() request: IssueBatchStockRequest,
  ): Promise<{ quantity: number }> {
    const quantity = await this.commandBus.execute(
      new IssueBatchStockCommand(productId, batchId, request.quantity),
    );

    this.logger.log(`Batch ${batchId} issued`, request);

    return { quantity };
  }

  @Patch(':productId/reconcile/:batchId')
  public async reconcileBatchStock(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) productId: string,
    @Param('batchId', new ParseUUIDPipe({ version: '4' })) batchId: string,
    @Body() request: ReconcileBatchStockRequest,
  ): Promise<{ quantity: number }> {
    const quantity = await this.commandBus.execute(
      new ReconcileBatchStockCommand(productId, batchId, request.quantity),
    );

    this.logger.log(`Batch ${batchId} reconciled`, request);

    return { quantity };
  }
}

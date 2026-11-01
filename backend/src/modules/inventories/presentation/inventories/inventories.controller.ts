import {
  Body,
  Controller,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AddBatchRequest } from './requests/add-batch.request';
import { AddBatchCommand } from '../../application/commands/add-batch/add-batch.command';
import { ReconcileBatchStockRequest } from './requests/reconcile-batch-stock.request';
import { ReconcileBatchStockCommand } from '../../application/commands/reconcile-batch-stock/reconcile-batch-stock.command';
import { ReceiveBatchStockCommand } from '../../application/commands/receive-batch-stock/receive-batch-stock.command';
import { ReceiveBatchStockRequest } from './requests/receive-batch-stock.request';
import { IssueBatchStockCommand } from '../../application/commands/issue-batch-stock/issue-batch-stock.command';
import { IssueBatchStockRequest } from './requests/issue-batch-stock.request';

@Controller('inventories')
export class InventoriesController {
  private readonly logger = new Logger(InventoriesController.name);

  public constructor(private readonly commandBus: CommandBus) {}

  @Post(':productId')
  public async addBatch(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) productId: string,
    @Body() request: AddBatchRequest,
  ): Promise<{ batchId: string }> {
    const result = await this.commandBus.execute(
      new AddBatchCommand(
        request.lotNumber,
        productId,
        request.quantity,
        request.unitCost,
        request.expiresAt,
        'b7eba190-9948-4cfb-a209-94d773775774', // temp userId
      ),
    );

    this.logger.log('Batch added', result);

    return result;
  }

  @Patch(':productId/receive/:batchId')
  public async receiveBatchStock(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) productId: string,
    @Param('batchId', new ParseUUIDPipe({ version: '4' })) batchId: string,
    @Body() request: ReceiveBatchStockRequest,
  ): Promise<{ quantity: number }> {
    const quantity = await this.commandBus.execute(
      new ReceiveBatchStockCommand(productId, batchId, request.quantity),
    );

    this.logger.log(`Batch ${batchId} received`, request);

    return { quantity };
  }

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

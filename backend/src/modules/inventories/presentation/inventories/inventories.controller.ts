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
import { AdjustBatchStockRequest } from './requests/adjust-batch-stock.request';
import { AdjustBatchStockCommand } from '../../application/commands/adjust-batch-stock/adjust-batch-stock.command';
import { IncreaseBatchStockCommand } from '../../application/commands/increase-batch-stock/increase-batch-stock.command';
import { IncreaseBatchStockRequest } from './requests/increase-batch-stock.request';
import { DecreaseBatchStockRequest } from './requests/decrease-batch-stock.request';
import { DecreaseBatchStockCommand } from '../../application/commands/decrease-batch-stock/decrease-batch-stock.command';

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

  @Patch(':productId/adjust/:batchId')
  public async adjustBatchStock(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) productId: string,
    @Param('batchId', new ParseUUIDPipe({ version: '4' })) batchId: string,
    @Body() request: AdjustBatchStockRequest,
  ): Promise<{ quantity: number }> {
    const quantity = await this.commandBus.execute(
      new AdjustBatchStockCommand(productId, batchId, request.delta),
    );

    this.logger.log(`Batch ${batchId} adjusted`, request);

    return { quantity };
  }

  @Patch(':productId/increase/:batchId')
  public async increaseBatchStock(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) productId: string,
    @Param('batchId', new ParseUUIDPipe({ version: '4' })) batchId: string,
    @Body() request: IncreaseBatchStockRequest,
  ): Promise<{ quantity: number }> {
    const quantity = await this.commandBus.execute(
      new IncreaseBatchStockCommand(productId, batchId, request.quantity),
    );

    this.logger.log(`Batch ${batchId} increased`, request);

    return { quantity };
  }

  @Patch(':productId/decrease/:batchId')
  public async decreaseBatchStock(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) productId: string,
    @Param('batchId', new ParseUUIDPipe({ version: '4' })) batchId: string,
    @Body() request: DecreaseBatchStockRequest,
  ): Promise<{ quantity: number }> {
    const quantity = await this.commandBus.execute(
      new DecreaseBatchStockCommand(productId, batchId, request.quantity),
    );

    this.logger.log(`Batch ${batchId} decreased`, request);

    return { quantity };
  }
}

import {
  Body,
  Controller,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AddBatchRequest } from './requests/add-batch.request';
import { AddBatchCommand } from '../../application/commands/add-batch/add-batch.command';

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
}

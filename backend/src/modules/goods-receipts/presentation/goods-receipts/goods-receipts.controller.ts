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
import { CreateGoodsReceiptCommand } from '../../application/commands/create-goods-receipt/create-goods-receipt.command';
import { ConfirmGoodsReceiptCommand } from '../../application/commands/confirm-goods-receipt/confirm-goods-receipt.command';
import { CancelGoodsReceiptCommand } from '../../application/commands/cancel-goods-receipt/cancel-goods-receipt.command';
import { CreateGoodsReceiptRequest } from './requests/create-goods-receipt.request';

const TEMP_USER_ID = 'b7eba190-9948-4cfb-a209-94d773775774';

@Controller('goods-receipts')
export class GoodsReceiptsController {
  private readonly logger = new Logger(GoodsReceiptsController.name);

  public constructor(private readonly commandBus: CommandBus) {}

  @Post()
  public create(
    @Body() request: CreateGoodsReceiptRequest,
  ): Promise<{ id: string; code: string }> {
    const response = this.commandBus.execute(
      new CreateGoodsReceiptCommand(
        request.supplierId,
        request.lines.map((line) => ({
          lotNumber: line.lotNumber,
          productId: line.productId,
          quantity: line.quantity,
          unitCost: line.unitCost,
          expiresAt: line.expiresAt,
        })),
        TEMP_USER_ID,
      ),
    );

    this.logger.log('Goods receipt created', response);

    return response;
  }

  @Patch(':id/confirm')
  public confirm(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ id: string }> {
    const response = this.commandBus.execute(
      new ConfirmGoodsReceiptCommand(id, TEMP_USER_ID),
    );

    this.logger.log(`Goods receipt ${id} confirmed`);

    return response;
  }

  @Patch(':id/cancel')
  public cancel(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ id: string }> {
    const response = this.commandBus.execute(
      new CancelGoodsReceiptCommand(id, TEMP_USER_ID),
    );

    this.logger.log(`Goods receipt ${id} cancelled`);

    return response;
  }
}

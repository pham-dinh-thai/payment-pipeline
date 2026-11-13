import {
  Body,
  Controller,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateGoodsReceiptCommand } from '../../application/commands/create-goods-receipt/create-goods-receipt.command';
import { ConfirmGoodsReceiptCommand } from '../../application/commands/confirm-goods-receipt/confirm-goods-receipt.command';
import { CancelGoodsReceiptCommand } from '../../application/commands/cancel-goods-receipt/cancel-goods-receipt.command';
import { CreateGoodsReceiptRequest } from './requests/create-goods-receipt.request';
import { AuthGuard } from '../../../../shared/modules/security/auth.guard';
import { PermissionsGuard } from '../../../../shared/modules/security/permissions.guard';
import { RequirePermissions } from '../../../../shared/modules/security/require-permissions.decorator';
import { ActorContext } from '../../../../shared/modules/security/actor-context.decorator';
import { type ActorHeaders } from '../../../../shared/types/actor-headers';

@Controller('goods-receipts')
@UseGuards(AuthGuard, PermissionsGuard)
export class GoodsReceiptsController {
  private readonly logger = new Logger(GoodsReceiptsController.name);

  public constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @RequirePermissions(['goods_receipts:create'])
  public create(
    @Body() request: CreateGoodsReceiptRequest,
    @ActorContext() headers: ActorHeaders,
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
        headers.actorId,
        headers,
      ),
    );

    this.logger.log('Goods receipt created', response);

    return response;
  }

  @Patch(':id/confirm')
  @RequirePermissions(['goods_receipts:confirm'])
  public confirm(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @ActorContext() headers: ActorHeaders,
  ): Promise<{ id: string }> {
    const response = this.commandBus.execute(
      new ConfirmGoodsReceiptCommand(id, headers.actorId, headers),
    );

    this.logger.log(`Goods receipt ${id} confirmed`);

    return response;
  }

  @Patch(':id/cancel')
  @RequirePermissions(['goods_receipts:cancel'])
  public cancel(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @ActorContext() headers: ActorHeaders,
  ): Promise<{ id: string }> {
    const response = this.commandBus.execute(
      new CancelGoodsReceiptCommand(id, headers.actorId, headers),
    );

    this.logger.log(`Goods receipt ${id} cancelled`);

    return response;
  }
}

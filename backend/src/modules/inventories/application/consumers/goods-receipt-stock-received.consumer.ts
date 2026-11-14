import { Injectable, OnModuleInit } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { OutboxConsumerRegistry } from '../../../../shared/modules/outbox/application/outbox-consumer.registry';
import { type OutboxConsumer } from '../../../../shared/modules/outbox/domain/outbox-consumer';
import { type OutboxEvent } from '../../../../shared/modules/outbox/domain/outbox.repository';
import {
  GOODS_RECEIPT_STOCK_RECEIVED_EVENT,
  type GoodsReceiptStockReceivedPayload,
} from '../../../goods-receipts/domain/events/goods-receipt-confirmed.event';
import { ReceiveStockCommand } from '../commands/receive-stock/receive-stock.command';

/**
 * Invoked by OutboxRelay, which already wraps `handle()` and
 * `markProcessed()` in one unit of work. Each ReceiveStockHandler call opens a
 * nested transaction (savepoint), so all lines and the processed flag commit
 * together; a failure rolls the whole event back.
 */
@Injectable()
export class GoodsReceiptStockReceivedConsumer
  implements OutboxConsumer, OnModuleInit
{
  public constructor(
    private readonly registry: OutboxConsumerRegistry,
    private readonly commandBus: CommandBus,
  ) {}

  public onModuleInit(): void {
    this.registry.register(GOODS_RECEIPT_STOCK_RECEIVED_EVENT, this);
  }

  public async handle(event: OutboxEvent): Promise<void> {
    const payload =
      event.payload as unknown as GoodsReceiptStockReceivedPayload;

    for (const line of payload.lines) {
      await this.commandBus.execute(
        new ReceiveStockCommand(
          line.lotNumber,
          line.productId,
          line.quantity,
          line.unitCost,
          new Date(line.expiresAt),
          payload.confirmedBy,
          line.batchId,
        ),
      );
    }
  }
}

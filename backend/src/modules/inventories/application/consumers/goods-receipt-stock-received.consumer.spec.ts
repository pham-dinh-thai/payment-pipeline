import { describe, expect, it, jest } from '@jest/globals';
import { CommandBus } from '@nestjs/cqrs';
import { OutboxConsumerRegistry } from '../../../../shared/modules/outbox/application/outbox-consumer.registry';
import { type OutboxEvent } from '../../../../shared/modules/outbox/domain/outbox.repository';
import {
  GOODS_RECEIPT_STOCK_RECEIVED_EVENT,
  type GoodsReceiptStockReceivedPayload,
} from '../../../goods-receipts/domain/events/goods-receipt-confirmed.event';
import { ReceiveStockCommand } from '../commands/receive-stock/receive-stock.command';
import { GoodsReceiptStockReceivedConsumer } from './goods-receipt-stock-received.consumer';

const GOODS_RECEIPT_ID = 'b3d7f2a8-7a0e-4f1c-9c1a-4d3f5e6a7b8c';
const CONFIRMED_BY = 'f1e2d3c4-b5a6-4978-8a9b-0c1d2e3f4a5b';
const FIRST_PRODUCT_ID = '8a2f6c1e-3b4d-4e5f-9a0b-1c2d3e4f5a6b';
const SECOND_PRODUCT_ID = '11111111-1111-4111-8111-111111111111';
const FIRST_BATCH_ID = '22222222-2222-4222-8222-222222222222';
const SECOND_BATCH_ID = '33333333-3333-4333-8333-333333333333';
const EXPIRES_AT = '2030-01-01T00:00:00.000Z';

const payload: GoodsReceiptStockReceivedPayload = {
  goodsReceiptId: GOODS_RECEIPT_ID,
  confirmedBy: CONFIRMED_BY,
  lines: [
    {
      batchId: FIRST_BATCH_ID,
      productId: FIRST_PRODUCT_ID,
      lotNumber: 'LOT-001',
      quantity: 10,
      unitCost: '2.50',
      expiresAt: EXPIRES_AT,
    },
    {
      batchId: SECOND_BATCH_ID,
      productId: SECOND_PRODUCT_ID,
      lotNumber: 'LOT-002',
      quantity: 5,
      unitCost: '4.00',
      expiresAt: EXPIRES_AT,
    },
  ],
};

const outboxEvent = (
  eventPayload: GoodsReceiptStockReceivedPayload = payload,
): OutboxEvent => ({
  id: 42,
  eventType: GOODS_RECEIPT_STOCK_RECEIVED_EVENT,
  payload: eventPayload,
  createdAt: new Date('2026-11-11T00:00:00.000Z'),
  processed: false,
  attempts: 0,
  lastError: null,
  failedAt: null,
});

const setup = () => {
  const execute = jest.fn<
    (command: ReceiveStockCommand) => Promise<{ batchId: string }>
  >(() => Promise.resolve({ batchId: FIRST_BATCH_ID }));
  const registry = new OutboxConsumerRegistry();
  const consumer = new GoodsReceiptStockReceivedConsumer(registry, {
    execute,
  } as unknown as CommandBus);

  consumer.onModuleInit();

  return { consumer, execute, registry };
};

describe('GoodsReceiptStockReceivedConsumer', () => {
  it('registers itself for the stock received event', () => {
    const { consumer, registry } = setup();

    expect(registry.get(GOODS_RECEIPT_STOCK_RECEIVED_EVENT)).toBe(consumer);
  });

  it('dispatches one receive command per line with the pre-generated batch id', async () => {
    const { consumer, execute } = setup();

    await consumer.handle(outboxEvent());

    expect(execute).toHaveBeenCalledTimes(2);

    const [first] = execute.mock.calls[0];
    const [second] = execute.mock.calls[1];

    expect(first).toBeInstanceOf(ReceiveStockCommand);
    expect(first).toMatchObject({
      batchId: FIRST_BATCH_ID,
      productId: FIRST_PRODUCT_ID,
      lotNumber: 'LOT-001',
      quantity: 10,
      unitCost: '2.50',
      createdBy: CONFIRMED_BY,
    });
    expect(first.expiresAt).toEqual(new Date(EXPIRES_AT));

    expect(second).toMatchObject({
      batchId: SECOND_BATCH_ID,
      productId: SECOND_PRODUCT_ID,
      lotNumber: 'LOT-002',
      quantity: 5,
      unitCost: '4.00',
      createdBy: CONFIRMED_BY,
    });
    expect(second.expiresAt).toEqual(new Date(EXPIRES_AT));
  });

  it('does nothing when the event has no lines', async () => {
    const { consumer, execute } = setup();

    await consumer.handle(
      outboxEvent({
        goodsReceiptId: GOODS_RECEIPT_ID,
        confirmedBy: CONFIRMED_BY,
        lines: [],
      }),
    );

    expect(execute).not.toHaveBeenCalled();
  });
});

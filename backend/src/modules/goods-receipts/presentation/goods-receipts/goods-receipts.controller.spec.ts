import { describe, expect, it, jest } from '@jest/globals';
import { CommandBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { GoodsReceiptsController } from './goods-receipts.controller';
import { CreateGoodsReceiptCommand } from '../../application/commands/create-goods-receipt/create-goods-receipt.command';
import { ConfirmGoodsReceiptCommand } from '../../application/commands/confirm-goods-receipt/confirm-goods-receipt.command';
import { CancelGoodsReceiptCommand } from '../../application/commands/cancel-goods-receipt/cancel-goods-receipt.command';
import { CreateGoodsReceiptRequest } from './requests/create-goods-receipt.request';
import { AuthGuard } from '../../../../shared/modules/security/auth.guard';
import { PermissionsGuard } from '../../../../shared/modules/security/permissions.guard';

const RECEIPT_ID = 'b3d7f2a8-7a0e-4f1c-9c1a-4d3f5e6a7b8c';
const SUPPLIER_ID = '0ca741a6-ce41-4010-8148-f7b2a32aef1c';
const PRODUCT_ID = '8a2f6c1e-3b4d-4e5f-9a0b-1c2d3e4f5a6b';
const ACTOR_ID = 'b7eba190-9948-4cfb-a209-94d773775774';
const EXPIRES_AT = new Date('2030-01-01T00:00:00.000Z');

const headers = {
  actorId: ACTOR_ID,
  actorType: 'user',
  actorLabel: 'admin@example.com',
  userIp: '127.0.0.1',
  userAgent: 'jest',
};

type Execute = (command: unknown) => Promise<unknown>;

const createRequest = (): CreateGoodsReceiptRequest => ({
  supplierId: SUPPLIER_ID,
  lines: [
    {
      lotNumber: 'LOT-001',
      productId: PRODUCT_ID,
      quantity: 10,
      unitCost: '2.50',
      expiresAt: EXPIRES_AT,
    },
  ],
});

describe('GoodsReceiptsController', () => {
  let controller: GoodsReceiptsController;
  let execute: jest.Mock<Execute>;

  beforeEach(async () => {
    execute = jest.fn<Execute>();

    const module = await Test.createTestingModule({
      controllers: [GoodsReceiptsController],
      providers: [{ provide: CommandBus, useValue: { execute } }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(GoodsReceiptsController);
  });

  describe('create', () => {
    it('dispatches CreateGoodsReceiptCommand with all lines and the actor', async () => {
      const request = createRequest();
      const response = { id: RECEIPT_ID, code: 'GR-0001' };

      execute.mockResolvedValue(response);

      const result = await controller.create(request, headers);

      expect(execute).toHaveBeenCalledTimes(1);
      expect(execute).toHaveBeenCalledWith(
        new CreateGoodsReceiptCommand(
          SUPPLIER_ID,
          [
            {
              lotNumber: 'LOT-001',
              productId: PRODUCT_ID,
              quantity: 10,
              unitCost: '2.50',
              expiresAt: EXPIRES_AT,
            },
          ],
          ACTOR_ID,
          headers,
        ),
      );
      expect(result).toBe(response);
    });
  });

  describe('confirm', () => {
    it('dispatches ConfirmGoodsReceiptCommand with the current user', async () => {
      execute.mockResolvedValue({ id: RECEIPT_ID });

      const result = await controller.confirm(RECEIPT_ID, headers);

      expect(execute).toHaveBeenCalledTimes(1);
      expect(execute).toHaveBeenCalledWith(
        new ConfirmGoodsReceiptCommand(RECEIPT_ID, ACTOR_ID, headers),
      );
      expect(result).toEqual({ id: RECEIPT_ID });
    });
  });

  describe('cancel', () => {
    it('dispatches CancelGoodsReceiptCommand with the current user', async () => {
      execute.mockResolvedValue({ id: RECEIPT_ID });

      const result = await controller.cancel(RECEIPT_ID, headers);

      expect(execute).toHaveBeenCalledTimes(1);
      expect(execute).toHaveBeenCalledWith(
        new CancelGoodsReceiptCommand(RECEIPT_ID, ACTOR_ID, headers),
      );
      expect(result).toEqual({ id: RECEIPT_ID });
    });
  });
});

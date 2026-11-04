import { Test, TestingModule } from '@nestjs/testing';
import { GoodsReceiptsController } from './goods-receipts.controller';

describe('GoodsReceiptsController', () => {
  let controller: GoodsReceiptsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoodsReceiptsController],
    }).compile();

    controller = module.get<GoodsReceiptsController>(GoodsReceiptsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

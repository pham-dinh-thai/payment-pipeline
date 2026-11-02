import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { InventoriesController } from './inventories.controller';
import { TransactionalCommandBus } from '../../../../shared/infrastructure/cqrs/transactional-command-bus';

describe('InventoriesController', () => {
  let controller: InventoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoriesController],
      providers: [
        { provide: TransactionalCommandBus, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<InventoriesController>(InventoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

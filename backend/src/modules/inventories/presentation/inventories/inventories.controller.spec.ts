import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { jest } from '@jest/globals';
import { InventoriesController } from './inventories.controller';

describe('InventoriesController', () => {
  let controller: InventoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoriesController],
      providers: [{ provide: CommandBus, useValue: { execute: jest.fn() } }],
    }).compile();

    controller = module.get<InventoriesController>(InventoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

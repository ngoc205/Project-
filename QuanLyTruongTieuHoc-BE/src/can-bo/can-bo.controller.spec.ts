import { Test, TestingModule } from '@nestjs/testing';
import { CanBoController } from './can-bo.controller';
import { CanBoService } from './can-bo.service';

describe('CanBoController', () => {
  let controller: CanBoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CanBoController],
      providers: [{ provide: CanBoService, useValue: {} }],
    }).compile();

    controller = module.get<CanBoController>(CanBoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

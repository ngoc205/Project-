import { Test, TestingModule } from '@nestjs/testing';
import { GiaovienController } from './giaovien.controller';
import { GiaovienService } from './giaovien.service';

describe('GiaovienController', () => {
  let controller: GiaovienController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GiaovienController],
      providers: [{ provide: GiaovienService, useValue: {} }],
    }).compile();

    controller = module.get<GiaovienController>(GiaovienController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

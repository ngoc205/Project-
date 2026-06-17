import { Test, TestingModule } from '@nestjs/testing';
import { GiaovienController } from './giaovien.controller';

describe('GiaovienController', () => {
  let controller: GiaovienController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GiaovienController],
    }).compile();

    controller = module.get<GiaovienController>(GiaovienController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

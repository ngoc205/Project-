import { Test, TestingModule } from '@nestjs/testing';
import { HocSinhController } from './hoc-sinh.controller';

describe('HocSinhController', () => {
  let controller: HocSinhController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HocSinhController],
    }).compile();

    controller = module.get<HocSinhController>(HocSinhController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

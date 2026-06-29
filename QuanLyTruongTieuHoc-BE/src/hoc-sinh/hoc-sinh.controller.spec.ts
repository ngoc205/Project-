import { Test, TestingModule } from '@nestjs/testing';
import { HocSinhController } from './hoc-sinh.controller';
import { HocSinhService } from './hoc-sinh.service';

describe('HocSinhController', () => {
  let controller: HocSinhController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HocSinhController],
      providers: [{ provide: HocSinhService, useValue: {} }],
    }).compile();

    controller = module.get<HocSinhController>(HocSinhController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

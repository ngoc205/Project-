import { Test, TestingModule } from '@nestjs/testing';
import { DiemController } from './diem.controller';
import { DiemService } from './diem.service';

describe('DiemController', () => {
  let controller: DiemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiemController],
      providers: [{ provide: DiemService, useValue: {} }],
    }).compile();

    controller = module.get<DiemController>(DiemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

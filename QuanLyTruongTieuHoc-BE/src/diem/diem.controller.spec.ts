import { Test, TestingModule } from '@nestjs/testing';
import { DiemController } from './diem.controller';

describe('DiemController', () => {
  let controller: DiemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiemController],
    }).compile();

    controller = module.get<DiemController>(DiemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

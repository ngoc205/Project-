import { Test, TestingModule } from '@nestjs/testing';
import { DiemService } from './diem.service';

describe('DiemService', () => {
  let service: DiemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiemService],
    }).compile();

    service = module.get<DiemService>(DiemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

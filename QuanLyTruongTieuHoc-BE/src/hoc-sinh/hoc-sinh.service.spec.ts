import { Test, TestingModule } from '@nestjs/testing';
import { HocSinhService } from './hoc-sinh.service';

describe('HocSinhService', () => {
  let service: HocSinhService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HocSinhService],
    }).compile();

    service = module.get<HocSinhService>(HocSinhService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { GiaovienService } from './giaovien.service';

describe('GiaovienService', () => {
  let service: GiaovienService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GiaovienService],
    }).compile();

    service = module.get<GiaovienService>(GiaovienService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

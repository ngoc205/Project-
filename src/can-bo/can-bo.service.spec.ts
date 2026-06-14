import { Test, TestingModule } from '@nestjs/testing';
import { CanBoService } from './can-bo.service';

describe('CanBoService', () => {
  let service: CanBoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CanBoService],
    }).compile();

    service = module.get<CanBoService>(CanBoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

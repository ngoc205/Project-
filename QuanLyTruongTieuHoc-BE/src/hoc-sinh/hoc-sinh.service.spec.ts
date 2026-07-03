import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HocSinh } from './entities/hoc-sinh.entity';
import { HocSinhService } from './hoc-sinh.service';

describe('HocSinhService', () => {
  let service: HocSinhService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HocSinhService,
        { provide: getRepositoryToken(HocSinh), useValue: {} },
      ],
    }).compile();

    service = module.get<HocSinhService>(HocSinhService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DiemService } from './diem.service';
import { DiemThi } from './entities/diem-thi.entity';

describe('DiemService', () => {
  let service: DiemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiemService,
        { provide: getRepositoryToken(DiemThi), useValue: {} },
      ],
    }).compile();

    service = module.get<DiemService>(DiemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

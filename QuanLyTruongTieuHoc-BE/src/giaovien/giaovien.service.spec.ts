import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { GiaovienService } from './giaovien.service';

describe('GiaovienService', () => {
  let service: GiaovienService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GiaovienService,
        { provide: getDataSourceToken(), useValue: { query: jest.fn() } },
      ],
    }).compile();

    service = module.get<GiaovienService>(GiaovienService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

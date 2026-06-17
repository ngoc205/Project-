import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CanBoService } from './can-bo.service';
import { CanBo } from './entities/can-bo.entity';

describe('CanBoService', () => {
  let service: CanBoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CanBoService,
        {
          provide: getRepositoryToken(CanBo),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
            update: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CanBoService>(CanBoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

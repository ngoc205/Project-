import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaiKhoan } from '../auth/tai-khoan.entity';
import { CanBoService } from './can-bo.service';
import { CanBo } from './entities/can-bo.entity';

describe('CanBoService', () => {
  let service: CanBoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CanBoService,
        { provide: getRepositoryToken(CanBo), useValue: {} },
        { provide: getRepositoryToken(TaiKhoan), useValue: {} },
      ],
    }).compile();

    service = module.get<CanBoService>(CanBoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

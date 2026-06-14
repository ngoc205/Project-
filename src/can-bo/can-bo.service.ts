import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CanBo } from './entities/can-bo.entity';

@Injectable()
export class CanBoService {
  constructor(
    @InjectRepository(CanBo)
    private readonly canBoRepository: Repository<CanBo>,
  ) {}

  create(canBo: CanBo) {
    return this.canBoRepository.save(canBo);
  }

  findAll() {
    return this.canBoRepository.find();
  }

  search(keyword: string) {
    return this.canBoRepository
      .createQueryBuilder('canbo')
      .where('canbo.HoTen LIKE :keyword', {
        keyword: `%${keyword}%`,
      })
      .getMany();
  }

  async update(id: number, canBo: Partial<CanBo>) {
    await this.canBoRepository.update(id, canBo);

    return this.canBoRepository.findOne({
      where: { MaCanBo: id },
    });
  }
}
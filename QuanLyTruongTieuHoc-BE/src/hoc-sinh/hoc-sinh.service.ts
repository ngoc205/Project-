import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HocSinh } from './entities/hoc-sinh.entity';

@Injectable()
export class HocSinhService {
  constructor(
    @InjectRepository(HocSinh)
    private readonly hocSinhRepository: Repository<HocSinh>,
  ) {}

  // ⭐ THÊM: CREATE
  async create(hocSinh: any) {
    if (!hocSinh.GioiTinh || hocSinh.GioiTinh === '') {
      hocSinh.GioiTinh = 'Nam';
    }
    return await this.hocSinhRepository.save(hocSinh);
  }

  // READ ALL (GIỮ NGUYÊN)
  findAll() {
    return this.hocSinhRepository.find();
  }

  // READ ONE (GIỮ NGUYÊN)
  findOne(id: number) {
    return this.hocSinhRepository.findOne({
      where: {
        HocSinhID: id,
      },
    });
  }

  // ⭐ THÊM: SEARCH
  search(keyword = '') {
    const normalizedKeyword = keyword.trim();
    if (!normalizedKeyword) return this.findAll();

    return this.hocSinhRepository
      .createQueryBuilder('hs')
      .where('hs.TenHocSinh LIKE :keyword', {
        keyword: `%${normalizedKeyword}%`,
      })
      .orWhere('CAST(hs.HocSinhID AS varchar) LIKE :keyword', {
        keyword: `%${normalizedKeyword}%`,
      })
      .orderBy('hs.HocSinhID', 'DESC')
      .getMany();
  }

  // UPDATE (GIỮ NGUYÊN)
  async update(id: number, hocSinh: Partial<HocSinh>) {
    await this.hocSinhRepository.update(id, hocSinh);

    return this.hocSinhRepository.findOne({
      where: {
        HocSinhID: id,
      },
    });
  }

  // DELETE (GIỮ NGUYÊN)
  async remove(id: number) {
    await this.hocSinhRepository.delete(id);

    return {
      message: 'Xóa học sinh thành công',
    };
  }
}

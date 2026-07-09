import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { HocSinh } from './entities/hoc-sinh.entity';

@Injectable()
export class HocSinhService {
  constructor(
    @InjectRepository(HocSinh)
    private readonly hocSinhRepository: Repository<HocSinh>,
    private readonly dataSource: DataSource,
  ) {}

  private studentWithClassQuery(whereSql = '', params: unknown[] = []) {
    return this.dataSource.query(
      `
      SELECT
        hs.HocSinhID,
        hs.TenHocSinh,
        hs.NgaySinh,
        hs.GioiTinh,
        hs.DiaChi,
        hs.AnhDaiDien,
        hs.IsActive,
        hs.NgayTao,
        hs.LopID,
        l.TenLop,
        k.TenKhoi
      FROM HocSinh hs
      LEFT JOIN Lop l ON l.LopID = hs.LopID
      LEFT JOIN Khoi k ON k.KhoiID = l.KhoiID
      ${whereSql}
      ORDER BY hs.HocSinhID DESC
    `,
      params,
    );
  }

  // ⭐ THÊM: CREATE
  async create(hocSinh: any) {
    if (!hocSinh.GioiTinh || hocSinh.GioiTinh === '') {
      hocSinh.GioiTinh = 'Nam';
    }
    return await this.hocSinhRepository.save(hocSinh);
  }

  // READ ALL (GIỮ NGUYÊN)
  findAll() {
    return this.studentWithClassQuery();
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

    return this.studentWithClassQuery(
      `
      WHERE hs.TenHocSinh LIKE @0
        OR CAST(hs.HocSinhID AS varchar) LIKE @0
        OR l.TenLop LIKE @0
      `,
      [`%${normalizedKeyword}%`],
    );
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

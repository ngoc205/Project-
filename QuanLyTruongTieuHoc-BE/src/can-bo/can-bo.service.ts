import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CanBo } from './entities/can-bo.entity';
import { TaiKhoan } from '../auth/tai-khoan.entity';

@Injectable()
export class CanBoService {
  constructor(
    @InjectRepository(CanBo)
    private readonly canBoRepository: Repository<CanBo>,

    @InjectRepository(TaiKhoan)
    private readonly taiKhoanRepository: Repository<TaiKhoan>,
  ) {}

  // CREATE (GIỮ NGUYÊN)
  async create(data: any) {
    const taiKhoan = await this.taiKhoanRepository.save({
      TenDangNhap: data.TenDangNhap,
      MatKhau: data.MatKhau,
      VaiTro: 'CanBo',
      IsActive: true,
    });

    const canBo = await this.canBoRepository.save({
      TaiKhoanID: taiKhoan.TaiKhoanID,
      HoTen: data.HoTen,
      NgaySinh: data.NgaySinh,
      SoDienThoai: data.SoDienThoai,
      ChucVu: data.ChucVu,
      IsActive: true,
    });

    return canBo;
  }

  // READ ALL (GIỮ NGUYÊN)
  findAll() {
    return this.canBoRepository.find();
  }

  // READ ONE (GIỮ NGUYÊN)
  findOne(id: number) {
    return this.canBoRepository.findOne({
      where: { CanBoID: id },
    });
  }

  // SEARCH (GIỮ NGUYÊN + có thể mở rộng sau)
  search(keyword: string) {
    return this.canBoRepository
      .createQueryBuilder('canbo')
      .where('canbo.HoTen LIKE :keyword', {
        keyword: `%${keyword}%`,
      })
      .getMany();
  }

  // UPDATE (GIỮ NGUYÊN)
  async update(id: number, canBo: Partial<CanBo>) {
    await this.canBoRepository.update(id, canBo);

    return this.canBoRepository.findOne({
      where: { CanBoID: id },
    });
  }

  // ⭐ THÊM MỚI: DELETE (LOGIC BẠN CẦN)
  async remove(id: number) {
    return await this.canBoRepository.delete({
      CanBoID: id,
    });
  }
}
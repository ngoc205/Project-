import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaiKhoan } from './tai-khoan.entity';

@Injectable()
export class TaiKhoanService {
  constructor(
    @InjectRepository(TaiKhoan)
    private taiKhoanRepo: Repository<TaiKhoan>,
  ) {}

  async findAll() {
    return await this.taiKhoanRepo.find({
      select: {
        TaiKhoanID: true,
        TenDangNhap: true,
        MatKhau: true,
        VaiTro: true,
        IsActive: true,
        NgayTao: true,
        NgayCapNhat: true,
      },
    });
  }

  async create(data: Partial<TaiKhoan>) {
    const newAccount = this.taiKhoanRepo.create(data);
    return await this.taiKhoanRepo.save(newAccount);
  }

  async update(id: number, data: Partial<TaiKhoan>) {
    const acc = await this.taiKhoanRepo.findOne({ where: { TaiKhoanID: id } });
    if (!acc) throw new NotFoundException('Không tìm thấy tài khoản!');

    await this.taiKhoanRepo.update(id, data);
    return this.taiKhoanRepo.findOne({ where: { TaiKhoanID: id } });
  }

  async remove(id: number) {
    await this.taiKhoanRepo.delete(id);
    return { message: 'Xóa tài khoản thành công!' };
  }
}

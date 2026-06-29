import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiemThi } from './entities/diem-thi.entity';
import { NhapDiemDto } from './dto/nhap-diem.dto';

@Injectable()
export class DiemService {
  constructor(
    @InjectRepository(DiemThi)
    private diemRepo: Repository<DiemThi>,
  ) {}

  // Hàm xử lý lưu điểm (Cả thêm mới và cập nhật)
  async capNhatDiem(dto: NhapDiemDto) {
    // 1. Kiểm tra xem học sinh này đã có dòng điểm của môn học này trong kỳ này chưa
    let bangDiem = await this.diemRepo.findOne({
      where: {
        HocSinhID: dto.hocSinhId,
        MonHocID: dto.monHocId,
        ThoiGianID: dto.thoiGianId,
      },
    });

    // 2. Nếu chưa có -> Tạo mới dòng điểm
    if (!bangDiem) {
      bangDiem = this.diemRepo.create({
        HocSinhID: dto.hocSinhId,
        MonHocID: dto.monHocId,
        ThoiGianID: dto.thoiGianId,
      });
    }

    // 3. Cập nhật các cột điểm tương ứng (Hệ số 1, Hệ số 2, Hệ số 3)
    // Dùng !== undefined để đảm bảo: Nếu GV chỉ nhập 1 cột điểm, các cột khác vẫn giữ nguyên không bị mất
    if (dto.diemMieng !== undefined) bangDiem.DiemMieng = dto.diemMieng;
    if (dto.diemGiuaKy !== undefined) bangDiem.DiemGiuaKy = dto.diemGiuaKy;
    if (dto.diemCuoiKy !== undefined) bangDiem.DiemCuoiKy = dto.diemCuoiKy;

    // 4. Lưu dữ liệu xuống DB
    await this.diemRepo.save(bangDiem);

    // 5. Tính toán Điểm trung bình trực tiếp để trả về cho Frontend
    let diemTB: number | null = null;
    if (bangDiem.DiemMieng != null && bangDiem.DiemGiuaKy != null && bangDiem.DiemCuoiKy != null) {
      // Công thức: (Miệng + Giữa Kỳ * 2 + Cuối Kỳ * 3) / 6
      const tong = Number(bangDiem.DiemMieng) + (Number(bangDiem.DiemGiuaKy) * 2) + (Number(bangDiem.DiemCuoiKy) * 3);
      diemTB = Math.round((tong / 6) * 100) / 100; // Làm tròn 2 chữ số thập phân
    }

    return {
      message: 'Lưu điểm thành công!',
      diemChiTiet: bangDiem,
      diemTrungBinh: diemTB,
    };
  }
}
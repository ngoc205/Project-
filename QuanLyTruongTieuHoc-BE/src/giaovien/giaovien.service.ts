import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class GiaovienService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  // Lấy Lịch dạy dựa vào TaiKhoanID
  async getLichDay(id: number) {
    const query = `
      SELECT 
        t.TenThu AS thu, 
        tkb.TietHocID AS tiet, 
        mh.TenMonHoc AS tenMonHoc, 
        l.TenLop AS tenLop, 
        tkb.GhiChu AS phongHoc
      FROM ThoiKhoaBieu tkb
      JOIN MonHoc mh ON tkb.MonHocID = mh.MonHocID
      JOIN Lop l ON tkb.LopID = l.LopID
      JOIN Thu t ON tkb.ThuID = t.ThuID
      JOIN GiaoVien gv ON tkb.GiaoVienID = gv.GiaoVienID
      WHERE gv.TaiKhoanID = @0
    `;
    return await this.dataSource.query(query, [id]);
  }

  // Lấy thông tin Lớp chủ nhiệm dựa vào TaiKhoanID
  async getLopChuNhiem(id: number) {
    const query = `
      SELECT l.TenLop AS tenLop
      FROM Lop l
      JOIN GiaoVien gv ON l.GiaoVienID = gv.GiaoVienID
      WHERE gv.TaiKhoanID = @0
    `;
    const result = await this.dataSource.query(query, [id]);
    return result.length > 0 ? { tenLop: result[0].tenLop, siSo: 35 } : null; 
  }
}
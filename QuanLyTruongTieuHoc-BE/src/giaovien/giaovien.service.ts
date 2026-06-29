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

<<<<<<< Updated upstream
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
=======
async getChiTietHocSinh(hocSinhId: number) {
  // JOIN bảng HocSinh với HocBa để lấy nhận xét và thông tin
  const rows = await this.dataSource.query(`
    SELECT hs.*, hb.NhanXet, hb.DoLenLop
    FROM HocSinh hs
    LEFT JOIN HocBa hb ON hs.HocSinhID = hb.HocSinhID
    WHERE hs.HocSinhID = @0
  `, [hocSinhId]);

  return rows[0]; // Trả về thông tin học sinh
}

// Lấy danh sách môn học để giáo viên nhập điểm (Phiên bản an toàn)
  async getMonHocTheoLop(lopId: number) {
    try {
      // Bỏ qua các bảng liên kết phức tạp, lấy thẳng tất cả môn học đang có
      return await this.dataSource.query(`
        SELECT MonHocID, TenMonHoc 
        FROM MonHoc
      `);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách môn học:", error);
      return [];
    }
  }

  // Lấy thông tin Lớp chủ nhiệm và Danh sách học sinh dựa vào TaiKhoanID
  async getLopChuNhiem(id: number) {
    const lopList = await this.dataSource.query(
      `SELECT l.LopID, l.TenLop FROM Lop l 
       JOIN GiaoVien gv ON l.GiaoVienID = gv.GiaoVienID 
       WHERE gv.TaiKhoanID = @0`, [id]
    );

    if (!lopList || lopList.length === 0) return { success: false, message: 'Chưa có lớp chủ nhiệm', data: null };

    const danhSachHocSinh = await this.dataSource.query(
      `SELECT HocSinhID, TenHocSinh, NgaySinh, GioiTinh, DiaChi FROM HocSinh WHERE LopID = @0`,
      [lopList[0].LopID]
    );

    return {
      success: true,
      lopChuNhiem: { id: lopList[0].LopID, tenLop: lopList[0].TenLop, siSo: danhSachHocSinh.length },
      danhSachHocSinh: danhSachHocSinh
    };
}
>>>>>>> Stashed changes
}
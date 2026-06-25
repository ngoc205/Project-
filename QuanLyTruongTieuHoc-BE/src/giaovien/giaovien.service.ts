import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

interface GiaoVienPayload {
  TaiKhoanID?: number | null;
  HoTen?: string;
  NgaySinh?: string | null;
  SoDienThoai?: string | null;
  DiaChi?: string | null;
  AnhDaiDien?: string | null;
  IsActive?: boolean;
}

@Injectable()
export class GiaovienService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  private teacherSelectSql(whereSql = '') {
    return `
      SELECT
        gv.GiaoVienID,
        gv.TaiKhoanID,
        tk.TenDangNhap,
        gv.HoTen,
        gv.NgaySinh,
        gv.SoDienThoai,
        gv.DiaChi,
        gv.AnhDaiDien,
        gv.IsActive,
        gv.NgayTao,
        gv.NgayCapNhat,
        lopCn.TenLop AS LopChuNhiem
      FROM GiaoVien gv
      LEFT JOIN TaiKhoan tk ON tk.TaiKhoanID = gv.TaiKhoanID
      OUTER APPLY (
        SELECT TOP 1 l.TenLop
        FROM Lop l
        LEFT JOIN ThoiGian tg ON tg.ThoiGianID = l.ThoiGianID
        WHERE l.GiaoVienID = gv.GiaoVienID
        ORDER BY ISNULL(tg.IsCurrent, 0) DESC, tg.NgayBatDau DESC, l.LopID DESC
      ) lopCn
      ${whereSql}
      ORDER BY gv.GiaoVienID DESC
    `;
  }

  async findAll() {
    return this.dataSource.query(this.teacherSelectSql());
  }

  async getOptions() {
    return this.dataSource.query(`
      SELECT tk.TaiKhoanID, tk.TenDangNhap
      FROM TaiKhoan tk
      LEFT JOIN GiaoVien gv ON gv.TaiKhoanID = tk.TaiKhoanID
      WHERE tk.VaiTro = 'GiaoVien' AND ISNULL(tk.IsActive, 1) = 1 AND gv.GiaoVienID IS NULL
      ORDER BY tk.TenDangNhap
    `);
  }

  async search(keyword = '') {
    const normalizedKeyword = keyword.trim();
    if (!normalizedKeyword) return this.findAll();

    return this.dataSource.query(
      this.teacherSelectSql(`
      WHERE gv.HoTen LIKE @0
        OR CAST(gv.GiaoVienID AS varchar) LIKE @0
        OR ISNULL(gv.SoDienThoai, '') LIKE @0
        OR ISNULL(tk.TenDangNhap, '') LIKE @0
      `),
      [`%${normalizedKeyword}%`],
    );
  }

  async findOne(giaoVienId: number) {
    const rows = await this.dataSource.query(
      `
      SELECT
        gv.GiaoVienID,
        gv.TaiKhoanID,
        tk.TenDangNhap,
        gv.HoTen,
        gv.NgaySinh,
        gv.SoDienThoai,
        gv.DiaChi,
        gv.AnhDaiDien,
        gv.IsActive,
        gv.NgayTao,
        gv.NgayCapNhat
      FROM GiaoVien gv
      LEFT JOIN TaiKhoan tk ON tk.TaiKhoanID = gv.TaiKhoanID
      WHERE gv.GiaoVienID = @0
    `,
      [giaoVienId],
    );

    if (!rows[0]) throw new NotFoundException('Không tìm thấy giáo viên!');
    return rows[0];
  }

  async create(payload: GiaoVienPayload) {
    const hoTen = payload.HoTen?.trim();
    if (!hoTen) throw new BadRequestException('Vui lòng nhập họ tên giáo viên!');

    const taiKhoanId = payload.TaiKhoanID ? Number(payload.TaiKhoanID) : null;
    if (taiKhoanId) await this.ensureTeacherAccountAvailable(taiKhoanId);

    const inserted = await this.dataSource.query(
      `
      INSERT INTO GiaoVien (TaiKhoanID, HoTen, NgaySinh, SoDienThoai, DiaChi, AnhDaiDien, IsActive, NgayTao, NgayCapNhat)
      OUTPUT INSERTED.GiaoVienID
      VALUES (@0, @1, @2, @3, @4, @5, @6, GETDATE(), GETDATE())
    `,
      [
        taiKhoanId,
        hoTen,
        payload.NgaySinh || null,
        payload.SoDienThoai || null,
        payload.DiaChi || null,
        payload.AnhDaiDien || null,
        payload.IsActive === false ? 0 : 1,
      ],
    );

    return this.findOne(inserted[0].GiaoVienID);
  }

  async update(giaoVienId: number, payload: GiaoVienPayload) {
    await this.findOne(giaoVienId);

    const hoTen = payload.HoTen?.trim();
    if (!hoTen) throw new BadRequestException('Vui lòng nhập họ tên giáo viên!');

    const taiKhoanId = payload.TaiKhoanID ? Number(payload.TaiKhoanID) : null;
    if (taiKhoanId) await this.ensureTeacherAccountAvailable(taiKhoanId, giaoVienId);

    await this.dataSource.query(
      `
      UPDATE GiaoVien
      SET TaiKhoanID = @0,
          HoTen = @1,
          NgaySinh = @2,
          SoDienThoai = @3,
          DiaChi = @4,
          AnhDaiDien = @5,
          IsActive = @6,
          NgayCapNhat = GETDATE()
      WHERE GiaoVienID = @7
    `,
      [
        taiKhoanId,
        hoTen,
        payload.NgaySinh || null,
        payload.SoDienThoai || null,
        payload.DiaChi || null,
        payload.AnhDaiDien || null,
        payload.IsActive === false ? 0 : 1,
        giaoVienId,
      ],
    );

    return this.findOne(giaoVienId);
  }

  async remove(giaoVienId: number) {
    await this.findOne(giaoVienId);

    const usedRows = await this.dataSource.query(
      `
      SELECT TOP 1 1 AS Used
      FROM Lop
      WHERE GiaoVienID = @0
      UNION
      SELECT TOP 1 1 AS Used
      FROM ThoiKhoaBieu
      WHERE GiaoVienID = @0
    `,
      [giaoVienId],
    );

    if (usedRows.length > 0) {
      throw new BadRequestException('Giáo viên đang được phân công lớp hoặc thời khóa biểu, không thể xóa!');
    }

    await this.dataSource.query(`DELETE FROM GiaoVien WHERE GiaoVienID = @0`, [giaoVienId]);
    return { message: 'Xóa giáo viên thành công!' };
  }

  private async ensureTeacherAccountAvailable(taiKhoanId: number, currentGiaoVienId?: number) {
    const accountRows = await this.dataSource.query(
      `SELECT TaiKhoanID FROM TaiKhoan WHERE TaiKhoanID = @0 AND VaiTro = 'GiaoVien'`,
      [taiKhoanId],
    );

    if (!accountRows[0]) {
      throw new BadRequestException('Tài khoản được chọn không phải tài khoản giáo viên!');
    }

    const usedRows = await this.dataSource.query(
      `
      SELECT GiaoVienID
      FROM GiaoVien
      WHERE TaiKhoanID = @0 AND (@1 IS NULL OR GiaoVienID <> @1)
    `,
      [taiKhoanId, currentGiaoVienId || null],
    );

    if (usedRows.length > 0) {
      throw new BadRequestException('Tài khoản này đã được gán cho giáo viên khác!');
    }
  }

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

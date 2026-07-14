import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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

interface DiemHocSinhPayload {
  HocSinhID?: number;
  DiemMieng?: number | string | null;
  DiemGiuaKy?: number | string | null;
  DiemCuoiKy?: number | string | null;
}

interface LuuDiemPayload {
  LopID?: number;
  MonHocID?: number;
  scores?: DiemHocSinhPayload[];
}

@Injectable()
export class GiaovienService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  private async hasHocSinhLopIdColumn() {
    const rows = await this.dataSource.query(`
      SELECT 1 AS ok
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'HocSinh' AND COLUMN_NAME = 'LopID'
    `);
    return rows.length > 0;
  }

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

  // Lấy thời khóa biểu của lớp chủ nhiệm dựa vào TaiKhoanID hoặc GiaoVienID.
  async getLichDay(id: number) {
    const hasLopId = await this.hasHocSinhLopIdColumn();
    const query = `
      WITH LopChuNhiem AS (
        SELECT TOP 1 l.LopID, l.TenLop, l.ThoiGianID
        FROM Lop l
        JOIN GiaoVien gv ON l.GiaoVienID = gv.GiaoVienID
        LEFT JOIN ThoiGian tg ON tg.ThoiGianID = l.ThoiGianID
        WHERE (
          (
            EXISTS (SELECT 1 FROM GiaoVien gvTheoTaiKhoan WHERE gvTheoTaiKhoan.TaiKhoanID = @0)
            AND gv.TaiKhoanID = @0
          )
          OR (
            NOT EXISTS (SELECT 1 FROM GiaoVien gvTheoTaiKhoan WHERE gvTheoTaiKhoan.TaiKhoanID = @0)
            AND gv.GiaoVienID = @0
          )
        )
        AND l.ThoiGianID = (${this.classTermSql(hasLopId)})
        ORDER BY
          CASE WHEN gv.TaiKhoanID = @0 THEN 0 ELSE 1 END,
          ISNULL(tg.IsCurrent, 0) DESC,
          tg.NgayBatDau DESC,
          l.LopID DESC
      )
      SELECT 
        t.TenThu AS thu, 
        tkb.TietHocID AS tiet, 
        mh.TenMonHoc AS tenMonHoc, 
        lcn.TenLop AS tenLop, 
        tkb.GhiChu AS phongHoc
      FROM ThoiKhoaBieu tkb
      JOIN MonHoc mh ON tkb.MonHocID = mh.MonHocID
      JOIN Thu t ON tkb.ThuID = t.ThuID
      JOIN LopChuNhiem lcn ON lcn.LopID = tkb.LopID
      ORDER BY t.ThuID, tkb.TietHocID
    `;
    return await this.dataSource.query(query, [id]);
  }

  private classTermSql(hasLopId: boolean) {
    const termWithStudentsSql = hasLopId
      ? `
        CASE WHEN EXISTS (
          SELECT 1
          FROM Lop lopCoHocSinh
          JOIN HocSinh hs ON hs.LopID = lopCoHocSinh.LopID
          WHERE lopCoHocSinh.ThoiGianID = tg.ThoiGianID
            AND ISNULL(hs.IsActive, 1) = 1
        ) THEN 0 ELSE 1 END,
      `
      : '';

    return `
      SELECT TOP 1 tg.ThoiGianID
      FROM ThoiGian tg
      ORDER BY
        ${termWithStudentsSql}
        CASE WHEN ISNULL(tg.IsCurrent, 0) = 1 THEN 0 ELSE 1 END,
        tg.NgayBatDau DESC,
        tg.ThoiGianID DESC
    `;
  }

  async getChiTietHocSinh(hocSinhId: number) {
    const rows = await this.dataSource.query(
      `
      SELECT TOP 1
        hs.HocSinhID,
        hs.TenHocSinh,
        hs.NgaySinh,
        hs.GioiTinh,
        hs.DiaChi,
        hs.AnhDaiDien,
        hs.IsActive,
        hs.NgayTao,
        hs.LopID,
        hb.NhanXet,
        hb.DoLenLop,
        l.TenLop,
        l.ThoiGianID
      FROM HocSinh hs
      LEFT JOIN Lop l ON l.LopID = hs.LopID
      OUTER APPLY (
        SELECT TOP 1 hb.NhanXet, hb.DoLenLop
        FROM HocBa hb
        WHERE hb.HocSinhID = hs.HocSinhID
        ORDER BY hb.NgayTao DESC
      ) hb
      WHERE hs.HocSinhID = @0
    `,
      [hocSinhId],
    );

    if (!rows[0]) throw new NotFoundException('Không tìm thấy học sinh!');

    const hocSinh = rows[0];
    const thoiGianRows = await this.dataSource.query(
      `
      SELECT TOP 1 ThoiGianID
      FROM (
        SELECT @0 AS ThoiGianID
        UNION ALL
        SELECT dt.ThoiGianID
        FROM DiemThi dt
        WHERE dt.HocSinhID = @1
      ) source
      WHERE ThoiGianID IS NOT NULL
      ORDER BY ThoiGianID DESC
    `,
      [hocSinh.ThoiGianID || null, hocSinhId],
    );
    const thoiGianId = thoiGianRows[0]?.ThoiGianID || null;

    const bangDiem = thoiGianId && hocSinh.LopID
      ? await this.dataSource.query(
          `
          SELECT
            mh.MonHocID,
            mh.TenMonHoc,
            dt.DiemMieng,
            dt.DiemGiuaKy,
            dt.DiemCuoiKy,
            CASE
              WHEN dt.DiemMieng IS NOT NULL AND dt.DiemGiuaKy IS NOT NULL AND dt.DiemCuoiKy IS NOT NULL
              THEN ROUND((dt.DiemMieng + dt.DiemGiuaKy * 2 + dt.DiemCuoiKy * 3) / 6.0, 2)
              ELSE NULL
            END AS DiemTrungBinh
          FROM (
            SELECT DISTINCT tkb.MonHocID
            FROM ThoiKhoaBieu tkb
            WHERE tkb.LopID = @2 AND tkb.MonHocID IS NOT NULL
          ) monTheoLop
          JOIN MonHoc mh ON mh.MonHocID = monTheoLop.MonHocID
          LEFT JOIN DiemThi dt ON dt.MonHocID = mh.MonHocID
            AND dt.HocSinhID = @0
            AND dt.ThoiGianID = @1
          WHERE ISNULL(mh.IsActive, 1) = 1
          ORDER BY mh.TenMonHoc
        `,
          [hocSinhId, thoiGianId, hocSinh.LopID],
        )
      : [];

    const diemDaHoanThanh = bangDiem.filter((item: { DiemTrungBinh: number | null }) => item.DiemTrungBinh !== null);
    const diemTrungBinhChung = diemDaHoanThanh.length
      ? Math.round(
          (diemDaHoanThanh.reduce((total: number, item: { DiemTrungBinh: number }) => total + Number(item.DiemTrungBinh), 0) /
            diemDaHoanThanh.length) *
            100,
        ) / 100
      : null;
    const daNhapDuDiem = bangDiem.length > 0 && diemDaHoanThanh.length === bangDiem.length;
    const duDieuKienLenLop = daNhapDuDiem && Number(diemTrungBinhChung) >= 5;

    return {
      ...hocSinh,
      bangDiem,
      tongKet: {
        ThoiGianID: thoiGianId,
        TongMon: bangDiem.length,
        TongMonDaCoDiem: diemDaHoanThanh.length,
        DiemTrungBinhChung: diemTrungBinhChung,
        DaNhapDuDiem: daNhapDuDiem,
        DuDieuKienLenLop: duDieuKienLenLop,
      },
    };
  }

  async getMonHocTheoLop(lopId: number) {
    try {
      return await this.dataSource.query(
        `
        SELECT DISTINCT mh.MonHocID, mh.TenMonHoc
        FROM ThoiKhoaBieu tkb
        JOIN MonHoc mh ON mh.MonHocID = tkb.MonHocID
        WHERE tkb.LopID = @0
          AND tkb.MonHocID IS NOT NULL
          AND ISNULL(mh.IsActive, 1) = 1
        ORDER BY mh.TenMonHoc
      `,
        [lopId],
      );
    } catch (error) {
      console.error('Lỗi khi lấy danh sách môn học:', error);
      return [];
    }
  }

  private async getLopChuNhiemRow(id: number) {
    const hasLopId = await this.hasHocSinhLopIdColumn();
    const lopList = await this.dataSource.query(
      `
      SELECT TOP 1 l.LopID, l.TenLop, l.ThoiGianID, l.GiaoVienID
      FROM Lop l
      JOIN GiaoVien gv ON l.GiaoVienID = gv.GiaoVienID
      LEFT JOIN ThoiGian tg ON tg.ThoiGianID = l.ThoiGianID
      WHERE (
        (
          EXISTS (SELECT 1 FROM GiaoVien gvTheoTaiKhoan WHERE gvTheoTaiKhoan.TaiKhoanID = @0)
          AND gv.TaiKhoanID = @0
        )
        OR (
          NOT EXISTS (SELECT 1 FROM GiaoVien gvTheoTaiKhoan WHERE gvTheoTaiKhoan.TaiKhoanID = @0)
          AND gv.GiaoVienID = @0
        )
      )
      AND l.ThoiGianID = (${this.classTermSql(hasLopId)})
      ORDER BY
        CASE WHEN gv.TaiKhoanID = @0 THEN 0 ELSE 1 END,
        ISNULL(tg.IsCurrent, 0) DESC,
        tg.NgayBatDau DESC,
        l.LopID DESC
    `,
      [id],
    );

    return lopList[0] || null;
  }

  private async getHocSinhTheoLop(lopId: number) {
    const hasLopId = await this.hasHocSinhLopIdColumn();
    const classFilter = hasLopId
      ? 'hs.LopID = @0'
      : 'EXISTS (SELECT 1 FROM HocBa hb WHERE hb.HocSinhID = hs.HocSinhID AND hb.LopID = @0)';

    return this.dataSource.query(
      `
      SELECT hs.HocSinhID, hs.TenHocSinh, hs.NgaySinh, hs.GioiTinh, hs.DiaChi
      FROM HocSinh hs
      WHERE ${classFilter} AND ISNULL(hs.IsActive, 1) = 1
      ORDER BY hs.TenHocSinh
    `,
      [lopId],
    );
  }

  private normalizeScore(value: unknown, label: string) {
    if (value === null || value === undefined || value === '') return null;

    const score = Number(value);
    if (!Number.isFinite(score) || score < 0 || score > 10) {
      throw new BadRequestException(`${label} phải là số từ 0 đến 10.`);
    }

    return score;
  }

  // Lấy thông tin lớp chủ nhiệm và danh sách học sinh dựa vào TaiKhoanID hoặc GiaoVienID.
  async getLopChuNhiem(id: number) {
    const lop = await this.getLopChuNhiemRow(id);

    if (!lop) {
      return { success: false, message: 'Chưa có lớp chủ nhiệm', data: null };
    }

    const danhSachHocSinh = await this.getHocSinhTheoLop(Number(lop.LopID));

    return {
      success: true,
      lopChuNhiem: {
        id: lop.LopID,
        LopID: lop.LopID,
        ThoiGianID: lop.ThoiGianID,
        tenLop: lop.TenLop,
        siSo: danhSachHocSinh.length,
      },
      danhSachHocSinh,
    };
  }

  async getBangDiemLopChuNhiem(id: number, requestedMonHocId?: number) {
    const lop = await this.getLopChuNhiemRow(id);
    if (!lop) {
      return { success: false, message: 'Chưa có lớp chủ nhiệm', data: null };
    }

    const monHoc = await this.getMonHocTheoLop(Number(lop.LopID));
    if (!monHoc.length) {
      return {
        success: true,
        lopChuNhiem: {
          id: lop.LopID,
          LopID: lop.LopID,
          ThoiGianID: lop.ThoiGianID,
          tenLop: lop.TenLop,
          siSo: 0,
        },
        monHoc,
        selectedMonHocId: null,
        danhSachHocSinh: [],
      };
    }

    const selectedMonHocId =
      requestedMonHocId && monHoc.some((item: { MonHocID: number }) => Number(item.MonHocID) === Number(requestedMonHocId))
        ? Number(requestedMonHocId)
        : Number(monHoc[0].MonHocID);

    const hasLopId = await this.hasHocSinhLopIdColumn();
    const classFilter = hasLopId
      ? 'hs.LopID = @0'
      : 'EXISTS (SELECT 1 FROM HocBa hb WHERE hb.HocSinhID = hs.HocSinhID AND hb.LopID = @0)';

    const danhSachHocSinh = await this.dataSource.query(
      `
      SELECT
        hs.HocSinhID,
        hs.TenHocSinh,
        hs.NgaySinh,
        hs.GioiTinh,
        hs.DiaChi,
        dt.DiemMieng,
        dt.DiemGiuaKy,
        dt.DiemCuoiKy
      FROM HocSinh hs
      LEFT JOIN DiemThi dt ON dt.HocSinhID = hs.HocSinhID
        AND dt.ThoiGianID = @1
        AND dt.MonHocID = @2
      WHERE ${classFilter} AND ISNULL(hs.IsActive, 1) = 1
      ORDER BY hs.TenHocSinh
    `,
      [lop.LopID, lop.ThoiGianID, selectedMonHocId],
    );

    return {
      success: true,
      lopChuNhiem: {
        id: lop.LopID,
        LopID: lop.LopID,
        ThoiGianID: lop.ThoiGianID,
        tenLop: lop.TenLop,
        siSo: danhSachHocSinh.length,
      },
      monHoc,
      selectedMonHocId,
      danhSachHocSinh,
    };
  }

  async updateNhanXetHocSinh(hocSinhId: number, nhanXet: string) {
    const rows = await this.dataSource.query(`SELECT TOP 1 HocSinhID, LopID FROM HocSinh WHERE HocSinhID = @0`, [hocSinhId]);
    if (!rows[0]) throw new BadRequestException('Không tìm thấy học sinh để cập nhật nhận xét.');

    const lopId = rows[0].LopID;
    if (!lopId) {
      return { success: true, message: 'Học sinh chưa thuộc lớp nào nên không thể lưu nhận xét.' };
    }

    await this.dataSource.query(
      `
      IF EXISTS (SELECT 1 FROM HocBa WHERE HocSinhID = @0 AND LopID = @1)
        UPDATE HocBa SET NhanXet = @2 WHERE HocSinhID = @0 AND LopID = @1
      ELSE
        INSERT INTO HocBa (HocSinhID, LopID, NhanXet, DoLenLop, NgayTao) VALUES (@0, @1, @2, 0, GETDATE())
      `,
      [hocSinhId, lopId, nhanXet || ''],
    );

    return { success: true, message: 'Cập nhật nhận xét thành công.' };
  }

  async luuBangDiemLopChuNhiem(id: number, payload: LuuDiemPayload) {
    const lop = await this.getLopChuNhiemRow(id);
    if (!lop) throw new BadRequestException('Giáo viên chưa có lớp chủ nhiệm.');

    const lopId = Number(payload.LopID);
    const monHocId = Number(payload.MonHocID);
    if (!lopId || Number(lop.LopID) !== lopId) {
      throw new BadRequestException('Lớp cần lưu không thuộc lớp chủ nhiệm của giáo viên.');
    }
    if (!monHocId) throw new BadRequestException('Vui lòng chọn môn học.');

    const monHoc = await this.getMonHocTheoLop(lopId);
    if (!monHoc.some((item: { MonHocID: number }) => Number(item.MonHocID) === monHocId)) {
      throw new BadRequestException('Môn học không tồn tại hoặc đã ngừng sử dụng.');
    }

    const hocSinh = await this.getHocSinhTheoLop(lopId);
    const hocSinhIds = new Set(hocSinh.map((item: { HocSinhID: number }) => Number(item.HocSinhID)));
    const scores = Array.isArray(payload.scores) ? payload.scores : [];

    await this.dataSource.transaction(async (manager) => {
      for (const item of scores) {
        const hocSinhId = Number(item.HocSinhID);
        if (!hocSinhIds.has(hocSinhId)) {
          throw new BadRequestException('Có học sinh không thuộc lớp chủ nhiệm.');
        }

        const diemMieng = this.normalizeScore(item.DiemMieng, 'Điểm hệ số 1');
        const diemGiuaKy = this.normalizeScore(item.DiemGiuaKy, 'Điểm hệ số 2');
        const diemCuoiKy = this.normalizeScore(item.DiemCuoiKy, 'Điểm hệ số 3');
        const existing = await manager.query(
          `SELECT DiemThiID FROM DiemThi WHERE HocSinhID = @0 AND ThoiGianID = @1 AND MonHocID = @2`,
          [hocSinhId, lop.ThoiGianID, monHocId],
        );

        if (existing[0]) {
          await manager.query(
            `UPDATE DiemThi
             SET DiemMieng = @0, DiemGiuaKy = @1, DiemCuoiKy = @2, NgayCapNhat = GETDATE()
             WHERE DiemThiID = @3`,
            [diemMieng, diemGiuaKy, diemCuoiKy, existing[0].DiemThiID],
          );
        } else {
          await manager.query(
            `INSERT INTO DiemThi (HocSinhID, ThoiGianID, MonHocID, DiemMieng, DiemGiuaKy, DiemCuoiKy, NgayCapNhat)
             VALUES (@0, @1, @2, @3, @4, @5, GETDATE())`,
            [hocSinhId, lop.ThoiGianID, monHocId, diemMieng, diemGiuaKy, diemCuoiKy],
          );
        }
      }
    });

    return this.getBangDiemLopChuNhiem(id, monHocId);
  }

  // =======================================================================
  // U5: THÔNG TIN CÁ NHÂN & U6: ĐỔI MẬT KHẨU
  // =======================================================================

  async getThongTinCaNhan(taiKhoanId: number) {
    const rows = await this.dataSource.query(
      `SELECT gv.HoTen AS TenGiaoVien, gv.NgaySinh, gv.SoDienThoai, gv.DiaChi 
       FROM GiaoVien gv 
       WHERE gv.TaiKhoanID = @0`,
      [taiKhoanId]
    );
    if (!rows[0]) throw new BadRequestException('Không tìm thấy thông tin giáo viên');
    return rows[0];
  }

  async updateThongTinCaNhan(taiKhoanId: number, soDienThoai: string, diaChi: string) {
    await this.dataSource.query(
      `UPDATE GiaoVien 
       SET SoDienThoai = @0, DiaChi = @1 
       WHERE TaiKhoanID = @2`,
      [soDienThoai, diaChi, taiKhoanId]
    );
    return { message: 'Lưu thông tin thành công!' };
  }

  async changePassword(taiKhoanId: number, matKhauCu: string, matKhauMoi: string) {
    if (!matKhauCu) {
      throw new BadRequestException('Vui lòng nhập mật khẩu cũ');
    }

    if (!matKhauMoi || matKhauMoi.length > 30) {
      throw new BadRequestException('Mật khẩu không hợp lệ (tối đa 30 ký tự)');
    }

    const rows = await this.dataSource.query(
      `SELECT MatKhau FROM TaiKhoan WHERE TaiKhoanID = @0`,
      [taiKhoanId],
    );

    if (!rows[0]) {
      throw new NotFoundException('Không tìm thấy tài khoản');
    }

    if (rows[0].MatKhau !== matKhauCu) {
      throw new UnauthorizedException('Mật khẩu cũ không đúng');
    }
    
    await this.dataSource.query(
      `UPDATE TaiKhoan 
       SET MatKhau = @0 
       WHERE TaiKhoanID = @1`,
      [matKhauMoi, taiKhoanId],
    );
    return { message: 'Mật khẩu đã thay đổi' };
  }
}

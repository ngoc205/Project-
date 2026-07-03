import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

interface TimetableEntryPayload {
  ThuID?: number;
  TietHocID?: number;
  MonHocID?: number | null;
  GhiChu?: string | null;
}

@Injectable()
export class ThoiKhoaBieuService {
  constructor(private readonly dataSource: DataSource) {}

  private async hasHocSinhLopIdColumn() {
    const rows = await this.dataSource.query(`
      SELECT 1 AS ok
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'HocSinh' AND COLUMN_NAME = 'LopID'
    `);
    return rows.length > 0;
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

  async getOptions() {
    const hasLopId = await this.hasHocSinhLopIdColumn();
    const classFilterSql = hasLopId
      ? `
        (
          EXISTS (SELECT 1 FROM HocSinh hs WHERE hs.LopID = l.LopID AND ISNULL(hs.IsActive, 1) = 1)
          OR NOT EXISTS (SELECT 1 FROM HocSinh hs WHERE hs.LopID IS NOT NULL AND ISNULL(hs.IsActive, 1) = 1)
            AND l.ThoiGianID = (${this.classTermSql(hasLopId)})
        )
      `
      : `l.ThoiGianID = (${this.classTermSql(hasLopId)})`;

    const [khoi, lop, thu, tietHoc, monHoc] = await Promise.all([
      this.dataSource.query(`SELECT KhoiID, TenKhoi FROM Khoi ORDER BY KhoiID`),
      this.dataSource.query(`
        SELECT l.LopID, l.KhoiID, k.TenKhoi, l.TenLop, l.ThoiGianID, l.GiaoVienID, gv.HoTen AS TenGiaoVien
        FROM Lop l
        LEFT JOIN Khoi k ON k.KhoiID = l.KhoiID
        LEFT JOIN GiaoVien gv ON gv.GiaoVienID = l.GiaoVienID
        JOIN ThoiGian tg ON tg.ThoiGianID = l.ThoiGianID
        WHERE ${classFilterSql}
        ORDER BY l.KhoiID, l.TenLop
      `),
      this.dataSource.query(`SELECT ThuID, TenThu, ThuTu FROM Thu ORDER BY ThuTu, ThuID`),
      this.dataSource.query(`SELECT TietHocID, TenTiet, TietSo FROM TietHoc ORDER BY TietSo, TietHocID`),
      this.dataSource.query(`SELECT MonHocID, TenMonHoc FROM MonHoc WHERE ISNULL(IsActive, 1) = 1 ORDER BY TenMonHoc`),
    ]);

    return { khoi, lop, thu, tietHoc, monHoc };
  }

  async findByClass(lopId: number) {
    if (!lopId) throw new BadRequestException('Vui lòng chọn lớp!');

    const classRows = await this.dataSource.query(
      `
      SELECT l.LopID, l.KhoiID, k.TenKhoi, l.TenLop, l.GiaoVienID, gv.HoTen AS TenGiaoVien
      FROM Lop l
      LEFT JOIN Khoi k ON k.KhoiID = l.KhoiID
      LEFT JOIN GiaoVien gv ON gv.GiaoVienID = l.GiaoVienID
      WHERE l.LopID = @0
    `,
      [lopId],
    );

    if (!classRows[0]) throw new NotFoundException('Không tìm thấy lớp học!');

    const entries = await this.dataSource.query(
      `
      SELECT
        tkb.ThoiKhoaBieuID,
        tkb.LopID,
        tkb.ThuID,
        t.TenThu,
        t.ThuTu,
        tkb.TietHocID,
        th.TenTiet,
        th.TietSo,
        tkb.MonHocID,
        mh.TenMonHoc,
        tkb.GiaoVienID,
        gv.HoTen AS TenGiaoVien,
        tkb.GhiChu
      FROM ThoiKhoaBieu tkb
      LEFT JOIN Thu t ON t.ThuID = tkb.ThuID
      LEFT JOIN TietHoc th ON th.TietHocID = tkb.TietHocID
      LEFT JOIN MonHoc mh ON mh.MonHocID = tkb.MonHocID
      LEFT JOIN GiaoVien gv ON gv.GiaoVienID = tkb.GiaoVienID
      WHERE tkb.LopID = @0
      ORDER BY t.ThuTu, th.TietSo
    `,
      [lopId],
    );

    return { lop: classRows[0], entries };
  }

  async updateByClass(lopId: number, entries: TimetableEntryPayload[]) {
    if (!lopId) throw new BadRequestException('Vui lòng chọn lớp!');
    if (!Array.isArray(entries)) throw new BadRequestException('Dữ liệu thời khóa biểu không hợp lệ!');

    const classRows = await this.dataSource.query(`SELECT LopID, GiaoVienID FROM Lop WHERE LopID = @0`, [lopId]);
    if (!classRows[0]) throw new NotFoundException('Không tìm thấy lớp học!');

    const giaoVienId = classRows[0].GiaoVienID || null;
    const normalized = entries
      .map((entry) => ({
        ThuID: Number(entry.ThuID),
        TietHocID: Number(entry.TietHocID),
        MonHocID: entry.MonHocID ? Number(entry.MonHocID) : null,
        GhiChu: entry.GhiChu || null,
      }))
      .filter((entry) => Number.isInteger(entry.ThuID) && Number.isInteger(entry.TietHocID));

    await this.dataSource.transaction(async (manager) => {
      await manager.query(`DELETE FROM ThoiKhoaBieu WHERE LopID = @0`, [lopId]);

      for (const entry of normalized) {
        if (!entry.MonHocID) continue;
        await manager.query(
          `
          INSERT INTO ThoiKhoaBieu (LopID, ThuID, TietHocID, MonHocID, GiaoVienID, GhiChu)
          VALUES (@0, @1, @2, @3, @4, @5)
        `,
          [lopId, entry.ThuID, entry.TietHocID, entry.MonHocID, giaoVienId, entry.GhiChu],
        );
      }
    });

    return {
      message: 'Cập nhật thành công',
      ...(await this.findByClass(lopId)),
    };
  }
}

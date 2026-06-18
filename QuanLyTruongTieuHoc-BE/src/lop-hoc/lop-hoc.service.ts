import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

interface LopHocPayload {
  TenLop?: string;
  KhoiID?: number;
  GiaoVienID?: number | null;
  HocSinhIDs?: number[];
}

@Injectable()
export class LopHocService {
  constructor(private readonly dataSource: DataSource) {}

  private async hasHocSinhLopIdColumn() {
    const rows = await this.dataSource.query(`
      SELECT 1 AS ok
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'HocSinh' AND COLUMN_NAME = 'LopID'
    `);
    return rows.length > 0;
  }

  private normalizeStudentIds(ids?: number[]) {
    if (!Array.isArray(ids)) return [];
    return [...new Set(ids.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0))];
  }

  async findAll() {
    const hasLopId = await this.hasHocSinhLopIdColumn();
    const studentCountSql = hasLopId
      ? `(SELECT COUNT(*) FROM HocSinh hs WHERE hs.LopID = l.LopID)`
      : `0`;

    return this.dataSource.query(`
      SELECT
        l.LopID,
        l.KhoiID,
        k.TenKhoi,
        l.TenLop,
        l.ThoiGianID,
        l.GiaoVienID,
        gv.HoTen AS TenGiaoVien,
        l.NgayTao,
        ${studentCountSql} AS SoHocSinh
      FROM Lop l
      LEFT JOIN Khoi k ON k.KhoiID = l.KhoiID
      LEFT JOIN GiaoVien gv ON gv.GiaoVienID = l.GiaoVienID
      ORDER BY l.KhoiID, l.TenLop
    `);
  }

  async getOptions() {
    const hasLopId = await this.hasHocSinhLopIdColumn();
    const studentOptionsSql = hasLopId
      ? `
        SELECT hs.HocSinhID, hs.TenHocSinh, hs.NgaySinh, hs.GioiTinh, hs.DiaChi, hs.LopID, l.TenLop
        FROM HocSinh hs
        LEFT JOIN Lop l ON l.LopID = hs.LopID
        WHERE ISNULL(hs.IsActive, 1) = 1
        ORDER BY hs.TenHocSinh
      `
      : `
        SELECT hs.HocSinhID, hs.TenHocSinh, hs.NgaySinh, hs.GioiTinh, hs.DiaChi, CAST(NULL AS INT) AS LopID, CAST(NULL AS VARCHAR(10)) AS TenLop
        FROM HocSinh hs
        WHERE ISNULL(hs.IsActive, 1) = 1
        ORDER BY hs.TenHocSinh
      `;

    const [khoi, lopMau, giaoVien, hocSinh] = await Promise.all([
      this.dataSource.query(`SELECT KhoiID, TenKhoi FROM Khoi ORDER BY KhoiID`),
      this.dataSource.query(`SELECT DISTINCT TenLop FROM Lop ORDER BY TenLop`),
      this.dataSource.query(`
        SELECT gv.GiaoVienID, gv.HoTen, gv.SoDienThoai
        FROM GiaoVien gv
        WHERE ISNULL(gv.IsActive, 1) = 1
        ORDER BY gv.HoTen
      `),
      this.dataSource.query(studentOptionsSql),
    ]);

    return {
      khoi,
      lopMau,
      giaoVien,
      hocSinh,
      canAssignStudents: hasLopId,
    };
  }

  async findOne(id: number) {
    const rows = await this.dataSource.query(
      `
      SELECT
        l.LopID,
        l.KhoiID,
        k.TenKhoi,
        l.TenLop,
        l.ThoiGianID,
        l.GiaoVienID,
        gv.HoTen AS TenGiaoVien,
        l.NgayTao
      FROM Lop l
      LEFT JOIN Khoi k ON k.KhoiID = l.KhoiID
      LEFT JOIN GiaoVien gv ON gv.GiaoVienID = l.GiaoVienID
      WHERE l.LopID = @0
    `,
      [id],
    );

    if (!rows[0]) {
      throw new NotFoundException('Không tìm thấy lớp học!');
    }

    const hasLopId = await this.hasHocSinhLopIdColumn();
    const hocSinh = hasLopId
      ? await this.dataSource.query(
          `
          SELECT hs.HocSinhID, hs.TenHocSinh, hs.NgaySinh, hs.GioiTinh, hs.DiaChi, hs.LopID, l.TenLop
          FROM HocSinh hs
          LEFT JOIN Lop l ON l.LopID = hs.LopID
          WHERE hs.LopID = @0
          ORDER BY hs.TenHocSinh
        `,
          [id],
        )
      : [];

    return { ...rows[0], hocSinh, canAssignStudents: hasLopId };
  }

  async create(payload: LopHocPayload) {
    const tenLop = (payload.TenLop || '').trim();
    const khoiId = Number(payload.KhoiID || 1);
    const giaoVienId = payload.GiaoVienID ? Number(payload.GiaoVienID) : null;
    const hocSinhIds = this.normalizeStudentIds(payload.HocSinhIDs);

    if (!tenLop) throw new BadRequestException('Vui lòng chọn lớp cần tạo!');
    if (!khoiId) throw new BadRequestException('Vui lòng chọn khối học!');
    if (!giaoVienId) throw new BadRequestException('Vui lòng chọn giáo viên chủ nhiệm!');

    const existed = await this.dataSource.query(`SELECT LopID FROM Lop WHERE TenLop = @0`, [tenLop]);
    if (existed.length > 0) throw new BadRequestException('Lớp đã chọn hiện đang tồn tại');

    const teacherBusy = await this.dataSource.query(`SELECT LopID FROM Lop WHERE GiaoVienID = @0`, [giaoVienId]);
    if (teacherBusy.length > 0) throw new BadRequestException('Giáo viên đã chủ nhiệm lớp khác!');

    const timeRows = await this.dataSource.query(`SELECT TOP 1 ThoiGianID FROM ThoiGian ORDER BY ThoiGianID`);
    const thoiGianId = timeRows[0]?.ThoiGianID;
    if (!thoiGianId) throw new BadRequestException('Chưa có dữ liệu ThoiGian để tạo lớp!');

    const hasLopId = await this.hasHocSinhLopIdColumn();
    if (hocSinhIds.length > 0 && !hasLopId) {
      throw new BadRequestException('Bảng HocSinh đang thiếu cột LopID nên chưa thể gán học sinh vào lớp.');
    }

    const lopId = await this.dataSource.transaction(async (manager) => {
      const inserted = await manager.query(
        `
        INSERT INTO Lop (KhoiID, TenLop, ThoiGianID, GiaoVienID, NgayTao)
        OUTPUT INSERTED.LopID
        VALUES (@0, @1, @2, @3, GETDATE())
      `,
        [khoiId, tenLop, thoiGianId, giaoVienId],
      );

      const newLopId = inserted[0].LopID;
      if (hasLopId && hocSinhIds.length > 0) {
        await manager.query(
          `UPDATE HocSinh SET LopID = @0 WHERE HocSinhID IN (${hocSinhIds.map((_, index) => `@${index + 1}`).join(',')})`,
          [newLopId, ...hocSinhIds],
        );
      }

      return newLopId;
    });

    return this.findOne(lopId);
  }

  async update(id: number, payload: LopHocPayload) {
    const current = await this.findOne(id);

    const tenLop = payload.TenLop?.trim() || current.TenLop;
    const khoiId = payload.KhoiID ? Number(payload.KhoiID) : current.KhoiID;
    const giaoVienId = payload.GiaoVienID ? Number(payload.GiaoVienID) : current.GiaoVienID;
    const hocSinhIds = this.normalizeStudentIds(payload.HocSinhIDs);
    const hasLopId = await this.hasHocSinhLopIdColumn();

    if (!khoiId) throw new BadRequestException('Vui lòng chọn khối học!');
    if (!giaoVienId) throw new BadRequestException('Vui lòng chọn giáo viên chủ nhiệm!');

    const existed = await this.dataSource.query(`SELECT LopID FROM Lop WHERE TenLop = @0 AND LopID <> @1`, [tenLop, id]);
    if (existed.length > 0) throw new BadRequestException('Tên lớp đã tồn tại!');

    const teacherBusy = await this.dataSource.query(`SELECT LopID FROM Lop WHERE GiaoVienID = @0 AND LopID <> @1`, [giaoVienId, id]);
    if (teacherBusy.length > 0) throw new BadRequestException('Giáo viên đã chủ nhiệm lớp khác!');

    if (hocSinhIds.length > 0 && !hasLopId) {
      throw new BadRequestException('Bảng HocSinh đang thiếu cột LopID nên chưa thể cập nhật danh sách học sinh.');
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        `UPDATE Lop SET KhoiID = @0, TenLop = @1, GiaoVienID = @2 WHERE LopID = @3`,
        [khoiId, tenLop, giaoVienId, id],
      );

      if (hasLopId) {
        await manager.query(`UPDATE HocSinh SET LopID = NULL WHERE LopID = @0`, [id]);
        if (hocSinhIds.length > 0) {
          await manager.query(
            `UPDATE HocSinh SET LopID = @0 WHERE HocSinhID IN (${hocSinhIds.map((_, index) => `@${index + 1}`).join(',')})`,
            [id, ...hocSinhIds],
          );
        }
      }
    });

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    const hasLopId = await this.hasHocSinhLopIdColumn();

    await this.dataSource.transaction(async (manager) => {
      if (hasLopId) {
        await manager.query(`UPDATE HocSinh SET LopID = NULL WHERE LopID = @0`, [id]);
      }
      await manager.query(`DELETE FROM Lop WHERE LopID = @0`, [id]);
    });

    return { message: 'Đã xóa lớp học thành công!' };
  }
}

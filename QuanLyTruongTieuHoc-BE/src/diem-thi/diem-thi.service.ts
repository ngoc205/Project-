import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

interface ScoreInput {
  HocSinhID: number;
  DiemMieng?: number | null;
  DiemGiuaKy?: number | null;
  DiemCuoiKy?: number | null;
}

interface SaveScoresPayload {
  LopID?: number;
  MonHocID?: number;
  scores?: ScoreInput[];
}

@Injectable()
export class DiemThiService {
  constructor(private readonly dataSource: DataSource) {}

  private async hasHocSinhLopIdColumn() {
    const rows = await this.dataSource.query(`
      SELECT 1 AS ok FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'HocSinh' AND COLUMN_NAME = 'LopID'
    `);
    return rows.length > 0;
  }

  async getOptions() {
    const [khoi, lop] = await Promise.all([
      this.dataSource.query(`SELECT KhoiID, TenKhoi FROM Khoi ORDER BY KhoiID`),
      this.dataSource.query(`
        SELECT l.LopID, l.KhoiID, l.TenLop, l.ThoiGianID, k.TenKhoi
        FROM Lop l
        LEFT JOIN Khoi k ON k.KhoiID = l.KhoiID
        WHERE l.ThoiGianID = (
          SELECT TOP 1 ThoiGianID
          FROM ThoiGian
          WHERE ISNULL(IsCurrent, 0) = 1
          ORDER BY NgayBatDau DESC, ThoiGianID DESC
        )
        ORDER BY l.KhoiID, l.TenLop
      `),
    ]);
    return { khoi, lop };
  }

  private async getClass(lopId: number) {
    const rows = await this.dataSource.query(
      `
        SELECT l.LopID, l.KhoiID, l.TenLop, l.ThoiGianID, k.TenKhoi, gv.HoTen AS TenGiaoVien
        FROM Lop l
        LEFT JOIN Khoi k ON k.KhoiID = l.KhoiID
        LEFT JOIN GiaoVien gv ON gv.GiaoVienID = l.GiaoVienID
        WHERE l.LopID = @0
      `,
      [lopId],
    );
    if (!rows[0]) throw new NotFoundException('Không tìm thấy lớp học.');
    return rows[0];
  }

  private async getSubjects() {
    return this.dataSource.query(`
      SELECT MonHocID, TenMonHoc
      FROM MonHoc
      WHERE ISNULL(IsActive, 1) = 1
      ORDER BY TenMonHoc
    `);
  }

  private async getStudents(lopId: number, thoiGianId: number, monHocId: number) {
    const hasLopId = await this.hasHocSinhLopIdColumn();
    const classFilter = hasLopId
      ? 'hs.LopID = @0'
      : 'EXISTS (SELECT 1 FROM HocBa hb WHERE hb.HocSinhID = hs.HocSinhID AND hb.LopID = @0)';

    return this.dataSource.query(
      `
        SELECT hs.HocSinhID, hs.TenHocSinh, hs.NgaySinh,
          dt.DiemMieng, dt.DiemGiuaKy, dt.DiemCuoiKy
        FROM HocSinh hs
        LEFT JOIN DiemThi dt ON dt.HocSinhID = hs.HocSinhID
          AND dt.ThoiGianID = @1 AND dt.MonHocID = @2
        WHERE ${classFilter} AND ISNULL(hs.IsActive, 1) = 1
        ORDER BY hs.TenHocSinh
      `,
      [lopId, thoiGianId, monHocId],
    );
  }

  async getGradebook(lopId?: number, requestedMonHocId?: number) {
    if (!lopId) throw new BadRequestException('Vui lòng chọn lớp.');
    const lop = await this.getClass(Number(lopId));
    const monHoc = await this.getSubjects();
    if (!monHoc.length) throw new NotFoundException('Chưa có môn học đang hoạt động.');

    const selectedMonHocId = requestedMonHocId && monHoc.some((item: { MonHocID: number }) => Number(item.MonHocID) === Number(requestedMonHocId))
      ? Number(requestedMonHocId)
      : Number(monHoc[0].MonHocID);
    const hocSinh = await this.getStudents(Number(lop.LopID), Number(lop.ThoiGianID), selectedMonHocId);
    return { lop, monHoc, selectedMonHocId, hocSinh };
  }

  private normalizeScore(value: unknown, label: string) {
    if (value === null || value === undefined || value === '') return null;
    const score = Number(value);
    if (!Number.isFinite(score) || score < 0 || score > 10) throw new BadRequestException(`${label} phải là số từ 0 đến 10.`);
    return score;
  }

  async saveGradebook(payload: SaveScoresPayload) {
    const lopId = Number(payload.LopID);
    const monHocId = Number(payload.MonHocID);
    if (!lopId || !monHocId) throw new BadRequestException('Vui lòng chọn lớp và môn học.');

    const lop = await this.getClass(lopId);
    const monHoc = await this.getSubjects();
    if (!monHoc.some((item: { MonHocID: number }) => Number(item.MonHocID) === monHocId)) throw new BadRequestException('Môn học không tồn tại hoặc đã bị ngừng sử dụng.');

    const scores = Array.isArray(payload.scores) ? payload.scores : [];
    const students = await this.getStudents(lopId, Number(lop.ThoiGianID), monHocId);
    const studentIds = new Set(students.map((student: { HocSinhID: number }) => Number(student.HocSinhID)));

    await this.dataSource.transaction(async (manager) => {
      for (const item of scores) {
        const hocSinhId = Number(item.HocSinhID);
        if (!studentIds.has(hocSinhId)) throw new BadRequestException('Học sinh không thuộc lớp đã chọn.');
        const diemMieng = this.normalizeScore(item.DiemMieng, 'Điểm hệ số 1');
        const diemGiuaKy = this.normalizeScore(item.DiemGiuaKy, 'Điểm hệ số 2');
        const diemCuoiKy = this.normalizeScore(item.DiemCuoiKy, 'Điểm hệ số 3');
        const existing = await manager.query(
          `SELECT DiemThiID FROM DiemThi WHERE HocSinhID = @0 AND ThoiGianID = @1 AND MonHocID = @2`,
          [hocSinhId, lop.ThoiGianID, monHocId],
        );
        if (existing[0]) {
          await manager.query(`UPDATE DiemThi SET DiemMieng = @0, DiemGiuaKy = @1, DiemCuoiKy = @2, NgayCapNhat = GETDATE() WHERE DiemThiID = @3`, [diemMieng, diemGiuaKy, diemCuoiKy, existing[0].DiemThiID]);
        } else {
          await manager.query(`INSERT INTO DiemThi (HocSinhID, ThoiGianID, MonHocID, DiemMieng, DiemGiuaKy, DiemCuoiKy, NgayCapNhat) VALUES (@0, @1, @2, @3, @4, @5, GETDATE())`, [hocSinhId, lop.ThoiGianID, monHocId, diemMieng, diemGiuaKy, diemCuoiKy]);
        }
      }
    });

    return this.getGradebook(lopId, monHocId);
  }
}

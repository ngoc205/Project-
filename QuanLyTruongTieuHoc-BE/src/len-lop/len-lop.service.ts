import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class LenLopService {
  constructor(private readonly dataSource: DataSource) {}

  private isHocKy1(term: { TenKy?: string }) {
    return String(term.TenKy || '').includes('1');
  }

  private isHocKy2(term: { TenKy?: string }) {
    return String(term.TenKy || '').includes('2');
  }

  private gradeSummarySql(studentAlias: string, timeExpression: string) {
    return `
      SELECT COUNT(requiredSubjects.MonHocID) AS TongMon,
        SUM(CASE WHEN dt.DiemMieng IS NOT NULL AND dt.DiemGiuaKy IS NOT NULL AND dt.DiemCuoiKy IS NOT NULL THEN 1 ELSE 0 END) AS TongMonDaCoDiem,
        AVG(CASE WHEN dt.DiemMieng IS NOT NULL AND dt.DiemGiuaKy IS NOT NULL AND dt.DiemCuoiKy IS NOT NULL
          THEN (dt.DiemMieng + dt.DiemGiuaKy * 2 + dt.DiemCuoiKy * 3) / 6.0
          ELSE NULL
        END) AS DiemTrungBinh
      FROM (
        SELECT DISTINCT subjectSource.MonHocID
        FROM (
          SELECT tkb.MonHocID
          FROM ThoiKhoaBieu tkb
          WHERE tkb.LopID = ${studentAlias}.LopID

          UNION ALL

          SELECT tkbFallback.MonHocID
          FROM Lop currentLop
          JOIN ThoiGian currentTerm ON currentTerm.ThoiGianID = currentLop.ThoiGianID
          JOIN ThoiGian fallbackTerm ON fallbackTerm.TenNam = currentTerm.TenNam
            AND fallbackTerm.TenKy LIKE N'%1%'
          JOIN Lop fallbackLop ON fallbackLop.ThoiGianID = fallbackTerm.ThoiGianID
            AND fallbackLop.KhoiID = currentLop.KhoiID
            AND fallbackLop.TenLop = currentLop.TenLop
          JOIN ThoiKhoaBieu tkbFallback ON tkbFallback.LopID = fallbackLop.LopID
          WHERE currentLop.LopID = ${studentAlias}.LopID
            AND NOT EXISTS (
              SELECT 1
              FROM ThoiKhoaBieu currentTkb
              WHERE currentTkb.LopID = ${studentAlias}.LopID
            )
        ) subjectSource
        JOIN MonHoc mh ON mh.MonHocID = subjectSource.MonHocID
        WHERE ISNULL(mh.IsActive, 1) = 1
      ) requiredSubjects
      LEFT JOIN DiemThi dt ON dt.MonHocID = requiredSubjects.MonHocID
        AND dt.HocSinhID = ${studentAlias}.HocSinhID
        AND dt.ThoiGianID = ${timeExpression}
    `;
  }

  private async ensureStudentClassColumn() {
    const rows = await this.dataSource.query(`SELECT 1 AS ok FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'HocSinh' AND COLUMN_NAME = 'LopID'`);
    if (!rows.length) throw new BadRequestException('Bảng HocSinh cần có cột LopID để thực hiện lên lớp. Hãy cập nhật cấu trúc cơ sở dữ liệu trước.');
  }

  private async getTransitionMode(sourceThoiGianId: number, targetThoiGianId: number) {
    if (!sourceThoiGianId || !targetThoiGianId || sourceThoiGianId === targetThoiGianId) throw new BadRequestException('Vui lòng chọn hai năm học khác nhau.');
    const terms = await this.dataSource.query(`SELECT ThoiGianID, TenNam, TenKy, NgayBatDau FROM ThoiGian WHERE ThoiGianID IN (@0, @1)`, [sourceThoiGianId, targetThoiGianId]);
    if (terms.length !== 2) throw new BadRequestException('Năm học được chọn không tồn tại.');
    const source = terms.find((term: { ThoiGianID: number }) => Number(term.ThoiGianID) === sourceThoiGianId);
    const target = terms.find((term: { ThoiGianID: number }) => Number(term.ThoiGianID) === targetThoiGianId);
    const sourceYear = Number(String(source?.TenNam || '').match(/\d{4}/)?.[0]);
    const targetYear = Number(String(target?.TenNam || '').match(/\d{4}/)?.[0]);

    if (this.isHocKy1(source) && this.isHocKy2(target) && source?.TenNam === target?.TenNam) {
      return 'semester' as const;
    }

    if (this.isHocKy2(source) && this.isHocKy1(target) && targetYear === sourceYear + 1) {
      return 'promotion' as const;
    }

    throw new BadRequestException('Chỉ hỗ trợ chuyển từ Học kỳ 1 sang Học kỳ 2 cùng năm, hoặc xét lên lớp từ Học kỳ 2 sang Học kỳ 1 năm kế tiếp.');
  }

  async getOptions() {
    const thoiGian = await this.dataSource.query(`SELECT ThoiGianID, TenNam, TenKy, IsCurrent, NgayBatDau FROM ThoiGian ORDER BY NgayBatDau DESC, ThoiGianID DESC`);
    return { thoiGian };
  }

  async createNextSchoolYear(sourceThoiGianId: number) {
    const rows = await this.dataSource.query(`SELECT TenNam, TenKy FROM ThoiGian WHERE ThoiGianID = @0`, [sourceThoiGianId]);
    const source = rows[0];
    if (!source || !String(source.TenKy || '').includes('2')) throw new BadRequestException('Vui lòng chọn Học kỳ 2 làm năm học nguồn.');
    const sourceStartYear = Number(String(source.TenNam || '').match(/\d{4}/)?.[0]);
    if (!sourceStartYear) throw new BadRequestException('Tên năm học nguồn không đúng định dạng, ví dụ: 2025-2026.');
    const nextStartYear = sourceStartYear + 1;
    const nextSchoolYear = `${nextStartYear}-${nextStartYear + 1}`;

    const created = await this.dataSource.transaction(async (manager) => {
      const result: string[] = [];
      const terms = [
        { tenKy: 'Học kỳ 1', start: `${nextStartYear}-09-05`, end: `${nextStartYear + 1}-01-15` },
        { tenKy: 'Học kỳ 2', start: `${nextStartYear + 1}-01-16`, end: `${nextStartYear + 1}-05-25` },
      ];
      for (const term of terms) {
        const existing = await manager.query(`SELECT ThoiGianID FROM ThoiGian WHERE TenNam = @0 AND TenKy = @1`, [nextSchoolYear, term.tenKy]);
        if (!existing[0]) {
          await manager.query(`INSERT INTO ThoiGian (TenNam, TenKy, IsCurrent, NgayBatDau, NgayKetThuc) VALUES (@0, @1, 0, @2, @3)`, [nextSchoolYear, term.tenKy, term.start, term.end]);
          result.push(term.tenKy);
        }
      }
      return result;
    });
    return { message: created.length ? `Đã tạo ${created.join(' và ')} năm học ${nextSchoolYear}.` : `Năm học ${nextSchoolYear} đã có sẵn.`, nextSchoolYear, created };
  }

  async preview(sourceThoiGianId: number, targetThoiGianId: number) {
    await this.ensureStudentClassColumn();
    const mode = await this.getTransitionMode(sourceThoiGianId, targetThoiGianId);

    if (mode === 'semester') {
      const classes = await this.dataSource.query(
        `
          SELECT l.LopID, l.TenLop, l.KhoiID, k.TenKhoi,
            COUNT(hs.HocSinhID) AS TongSo,
            COUNT(hs.HocSinhID) AS DuDieuKien,
            0 AS OLaLop,
            0 AS TotNghiep
          FROM Lop l
          JOIN Khoi k ON k.KhoiID = l.KhoiID
          LEFT JOIN HocSinh hs ON hs.LopID = l.LopID AND ISNULL(hs.IsActive, 1) = 1
          WHERE l.ThoiGianID = @0
          GROUP BY l.LopID, l.TenLop, l.KhoiID, k.TenKhoi
          ORDER BY l.KhoiID, l.TenLop
        `,
        [sourceThoiGianId],
      );
      const totals = classes.reduce((result: { tongSo: number; duDieuKien: number; oLaiLop: number; totNghiep: number }, item: any) => ({
        tongSo: result.tongSo + Number(item.TongSo || 0), duDieuKien: result.duDieuKien + Number(item.DuDieuKien || 0), oLaiLop: result.oLaiLop, totNghiep: result.totNghiep,
      }), { tongSo: 0, duDieuKien: 0, oLaiLop: 0, totNghiep: 0 });
      return { mode, classes, totals };
    }

    const maxGradeRows = await this.dataSource.query(`SELECT MAX(KhoiID) AS MaxKhoiID FROM Khoi`);
    const maxGrade = Number(maxGradeRows[0]?.MaxKhoiID || 0);
    const classes = await this.dataSource.query(
      `
        SELECT l.LopID, l.TenLop, l.KhoiID, k.TenKhoi,
          COUNT(hs.HocSinhID) AS TongSo,
          SUM(CASE WHEN hs.HocSinhID IS NOT NULL AND ISNULL(grade.TongMon, 0) > 0 AND ISNULL(grade.TongMonDaCoDiem, 0) = ISNULL(grade.TongMon, 0) AND ISNULL(grade.DiemTrungBinh, 0) >= 5 AND l.KhoiID < @1 THEN 1 ELSE 0 END) AS DuDieuKien,
          SUM(CASE WHEN hs.HocSinhID IS NOT NULL AND (ISNULL(grade.TongMon, 0) = 0 OR ISNULL(grade.TongMonDaCoDiem, 0) < ISNULL(grade.TongMon, 0) OR ISNULL(grade.DiemTrungBinh, 0) < 5) THEN 1 ELSE 0 END) AS OLaLop,
          SUM(CASE WHEN hs.HocSinhID IS NOT NULL AND ISNULL(grade.TongMon, 0) > 0 AND ISNULL(grade.TongMonDaCoDiem, 0) = ISNULL(grade.TongMon, 0) AND ISNULL(grade.DiemTrungBinh, 0) >= 5 AND l.KhoiID = @1 THEN 1 ELSE 0 END) AS TotNghiep
        FROM Lop l
        JOIN Khoi k ON k.KhoiID = l.KhoiID
        JOIN ThoiGian tg ON tg.ThoiGianID = l.ThoiGianID
        LEFT JOIN HocSinh hs ON hs.LopID = l.LopID AND ISNULL(hs.IsActive, 1) = 1
        OUTER APPLY (
          ${this.gradeSummarySql('hs', 'l.ThoiGianID')}
        ) grade
        WHERE (
          l.ThoiGianID = @0
          OR (
            NOT EXISTS (
              SELECT 1
              FROM Lop sourceLop
              JOIN HocSinh sourceHs ON sourceHs.LopID = sourceLop.LopID AND ISNULL(sourceHs.IsActive, 1) = 1
              WHERE sourceLop.ThoiGianID = @0
            )
            AND l.ThoiGianID = (
              SELECT TOP 1 fallbackTerm.ThoiGianID
              FROM ThoiGian sourceTerm
              JOIN ThoiGian fallbackTerm ON fallbackTerm.TenNam = sourceTerm.TenNam
                AND fallbackTerm.TenKy LIKE N'%1%'
              WHERE sourceTerm.ThoiGianID = @0
              ORDER BY fallbackTerm.ThoiGianID DESC
            )
          )
        )
        GROUP BY l.LopID, l.TenLop, l.KhoiID, k.TenKhoi
        ORDER BY l.KhoiID, l.TenLop
      `,
      [sourceThoiGianId, maxGrade],
    );
    const totals = classes.reduce((result: { tongSo: number; duDieuKien: number; oLaiLop: number; totNghiep: number }, item: any) => ({
      tongSo: result.tongSo + Number(item.TongSo || 0), duDieuKien: result.duDieuKien + Number(item.DuDieuKien || 0), oLaiLop: result.oLaiLop + Number(item.OLaLop || 0), totNghiep: result.totNghiep + Number(item.TotNghiep || 0),
    }), { tongSo: 0, duDieuKien: 0, oLaiLop: 0, totNghiep: 0 });
    return { mode, classes, totals };
  }

  private targetClassName(name: string, targetKhoiId: number) {
    return /^\d+/.test(name) ? name.replace(/^\d+/, String(targetKhoiId)) : `${targetKhoiId}${name}`;
  }

  async promote(sourceThoiGianId: number, targetThoiGianId: number) {
    await this.ensureStudentClassColumn();
    const mode = await this.getTransitionMode(sourceThoiGianId, targetThoiGianId);
    if (mode === 'semester') return this.syncSemester(sourceThoiGianId, targetThoiGianId);

    const preview = await this.preview(sourceThoiGianId, targetThoiGianId);
    if (!preview.totals.tongSo) throw new BadRequestException('Năm học nguồn chưa có học sinh nào để lên lớp.');

    const result = await this.dataSource.transaction(async (manager) => {
      const maxGradeRows = await manager.query(`SELECT MAX(KhoiID) AS MaxKhoiID FROM Khoi`);
      const maxGrade = Number(maxGradeRows[0].MaxKhoiID);
      const sourceClasses = await manager.query(
        `
          SELECT l.LopID, l.KhoiID, l.TenLop, l.GiaoVienID, l.ThoiGianID
          FROM Lop l
          WHERE (
            l.ThoiGianID = @0
            OR (
              NOT EXISTS (
                SELECT 1
                FROM Lop sourceLop
                JOIN HocSinh sourceHs ON sourceHs.LopID = sourceLop.LopID AND ISNULL(sourceHs.IsActive, 1) = 1
                WHERE sourceLop.ThoiGianID = @0
              )
              AND l.ThoiGianID = (
                SELECT TOP 1 fallbackTerm.ThoiGianID
                FROM ThoiGian sourceTerm
                JOIN ThoiGian fallbackTerm ON fallbackTerm.TenNam = sourceTerm.TenNam
                  AND fallbackTerm.TenKy LIKE N'%1%'
                WHERE sourceTerm.ThoiGianID = @0
                ORDER BY fallbackTerm.ThoiGianID DESC
              )
            )
          )
          ORDER BY l.KhoiID, l.TenLop
        `,
        [sourceThoiGianId],
      );
      let promoted = 0;
      let retained = 0;
      let graduated = 0;
      let backupCount = 0;
      let createdClasses = 0;

      const ensureClass = async (source: any, khoiId: number, tenLop: string) => {
        const existing = await manager.query(`SELECT TOP 1 LopID FROM Lop WHERE ThoiGianID = @0 AND KhoiID = @1 AND TenLop = @2`, [targetThoiGianId, khoiId, tenLop]);
        if (existing[0]) return Number(existing[0].LopID);
        const inserted = await manager.query(`INSERT INTO Lop (KhoiID, TenLop, ThoiGianID, GiaoVienID, NgayTao) OUTPUT INSERTED.LopID VALUES (@0, @1, @2, @3, GETDATE())`, [khoiId, tenLop, targetThoiGianId, source.GiaoVienID || null]);
        createdClasses += 1;
        return Number(inserted[0].LopID);
      };

      for (const source of sourceClasses) {
        const students = await manager.query(
          `
            SELECT hs.HocSinhID,
              CASE WHEN ISNULL(grade.TongMon, 0) > 0 AND ISNULL(grade.TongMonDaCoDiem, 0) = ISNULL(grade.TongMon, 0) AND ISNULL(grade.DiemTrungBinh, 0) >= 5 THEN 1 ELSE 0 END AS DoLenLop
            FROM HocSinh hs
            OUTER APPLY (
              ${this.gradeSummarySql('hs', '@1')}
            ) grade
            WHERE hs.LopID = @0 AND ISNULL(hs.IsActive, 1) = 1
          `,
          [source.LopID, source.ThoiGianID],
        );
        let promotedClassId: number | null = null;
        let retainedClassId: number | null = null;
        for (const student of students) {
          const canPromote = Boolean(student.DoLenLop);
          await manager.query(`IF NOT EXISTS (SELECT 1 FROM HocBa WHERE HocSinhID = @0 AND LopID = @1) INSERT INTO HocBa (HocSinhID, LopID, NhanXet, DoLenLop, NgayTao) VALUES (@0, @1, N'Tự động backup khi lên lớp', @2, GETDATE())`, [student.HocSinhID, source.LopID, canPromote ? 1 : 0]);
          backupCount += 1;
          if (canPromote && Number(source.KhoiID) < maxGrade) {
            if (!promotedClassId) promotedClassId = await ensureClass(source, Number(source.KhoiID) + 1, this.targetClassName(source.TenLop, Number(source.KhoiID) + 1));
            await manager.query(`UPDATE HocSinh SET LopID = @0 WHERE HocSinhID = @1`, [promotedClassId, student.HocSinhID]);
            promoted += 1;
          } else if (!canPromote) {
            if (!retainedClassId) retainedClassId = await ensureClass(source, Number(source.KhoiID), source.TenLop);
            await manager.query(`UPDATE HocSinh SET LopID = @0 WHERE HocSinhID = @1`, [retainedClassId, student.HocSinhID]);
            retained += 1;
          } else {
            await manager.query(`UPDATE HocSinh SET LopID = NULL WHERE HocSinhID = @0`, [student.HocSinhID]);
            graduated += 1;
          }
        }
      }
      await manager.query(`UPDATE ThoiGian SET IsCurrent = CASE WHEN ThoiGianID = @0 THEN 1 ELSE 0 END`, [targetThoiGianId]);

      const deletableClasses = await manager.query(
        `
          SELECT l.LopID
          FROM Lop l
          JOIN ThoiGian tg ON tg.ThoiGianID = l.ThoiGianID
          WHERE l.ThoiGianID = @0
            AND NOT EXISTS (SELECT 1 FROM HocSinh hs WHERE hs.LopID = l.LopID AND ISNULL(hs.IsActive, 1) = 1)
            AND NOT EXISTS (SELECT 1 FROM HocBa hb WHERE hb.LopID = l.LopID)
        `,
        [sourceThoiGianId],
      );
      for (const item of deletableClasses) {
        await manager.query(`DELETE FROM ThoiKhoaBieu WHERE LopID = @0`, [item.LopID]);
        await manager.query(`DELETE FROM Lop WHERE LopID = @0`, [item.LopID]);
      }

      return { promoted, retained, graduated, backupCount, createdClasses, deletedOldClasses: deletableClasses.length };
    });
    return { message: 'Toàn bộ học sinh đủ điều kiện đã lên lớp.', ...result };
  }

  private async syncSemester(sourceThoiGianId: number, targetThoiGianId: number) {
    const result = await this.dataSource.transaction(async (manager) => {
      const sourceClasses = await manager.query(
        `SELECT LopID, KhoiID, TenLop, GiaoVienID FROM Lop WHERE ThoiGianID = @0 ORDER BY KhoiID, TenLop`,
        [sourceThoiGianId],
      );
      let moved = 0;
      let createdClasses = 0;

      const ensureClass = async (source: any) => {
        const existing = await manager.query(
          `SELECT TOP 1 LopID FROM Lop WHERE ThoiGianID = @0 AND KhoiID = @1 AND TenLop = @2`,
          [targetThoiGianId, source.KhoiID, source.TenLop],
        );
        if (existing[0]) return Number(existing[0].LopID);

        const inserted = await manager.query(
          `INSERT INTO Lop (KhoiID, TenLop, ThoiGianID, GiaoVienID, NgayTao) OUTPUT INSERTED.LopID VALUES (@0, @1, @2, @3, GETDATE())`,
          [source.KhoiID, source.TenLop, targetThoiGianId, source.GiaoVienID || null],
        );
        createdClasses += 1;
        return Number(inserted[0].LopID);
      };

      const copyTimetable = async (sourceLopId: number, targetLopId: number) => {
        await manager.query(
          `
            INSERT INTO ThoiKhoaBieu (LopID, ThuID, TietHocID, MonHocID, GiaoVienID, GhiChu)
            SELECT @1, tkb.ThuID, tkb.TietHocID, tkb.MonHocID, tkb.GiaoVienID, tkb.GhiChu
            FROM ThoiKhoaBieu tkb
            WHERE tkb.LopID = @0
              AND NOT EXISTS (
                SELECT 1
                FROM ThoiKhoaBieu targetTkb
                WHERE targetTkb.LopID = @1
                  AND targetTkb.ThuID = tkb.ThuID
                  AND targetTkb.TietHocID = tkb.TietHocID
              )
          `,
          [sourceLopId, targetLopId],
        );
      };

      for (const source of sourceClasses) {
        const students = await manager.query(
          `SELECT HocSinhID FROM HocSinh WHERE LopID = @0 AND ISNULL(IsActive, 1) = 1`,
          [source.LopID],
        );
        if (!students.length) continue;

        const targetClassId = await ensureClass(source);
        await copyTimetable(source.LopID, targetClassId);
        await manager.query(
          `UPDATE HocSinh SET LopID = @0 WHERE LopID = @1 AND ISNULL(IsActive, 1) = 1`,
          [targetClassId, source.LopID],
        );
        moved += students.length;
      }

      await manager.query(`UPDATE ThoiGian SET IsCurrent = CASE WHEN ThoiGianID = @0 THEN 1 ELSE 0 END`, [targetThoiGianId]);

      return { moved, createdClasses };
    });

    return {
      message: 'Đã cập nhật học sinh sang học kỳ mới.',
      promoted: result.moved,
      retained: 0,
      graduated: 0,
      backupCount: 0,
      createdClasses: result.createdClasses,
      deletedOldClasses: 0,
    };
  }
}

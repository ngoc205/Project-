import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaiKhoan } from './tai-khoan.entity';

@Injectable()
export class TaiKhoanService implements OnModuleInit {
  constructor(
    @InjectRepository(TaiKhoan)
    private taiKhoanRepo: Repository<TaiKhoan>,
  ) {}

  async onModuleInit() {
    await this.ensureUsernameColumnSupportsUnicode();
    await this.repairCorruptedTeacherUsernames();
  }

  private async ensureUsernameColumnSupportsUnicode() {
    await this.taiKhoanRepo.query(`
      IF EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'TaiKhoan'
          AND COLUMN_NAME = 'TenDangNhap'
          AND DATA_TYPE <> 'nvarchar'
      )
      BEGIN
        DECLARE @constraintName sysname;
        DECLARE @dropConstraintSql nvarchar(max);

        SELECT TOP 1 @constraintName = kc.name
        FROM sys.key_constraints kc
        JOIN sys.index_columns ic
          ON ic.object_id = kc.parent_object_id
         AND ic.index_id = kc.unique_index_id
        JOIN sys.columns c
          ON c.object_id = ic.object_id
         AND c.column_id = ic.column_id
        WHERE kc.parent_object_id = OBJECT_ID(N'dbo.TaiKhoan')
          AND kc.type = 'UQ'
          AND c.name = N'TenDangNhap';

        IF @constraintName IS NOT NULL
        BEGIN
          SET @dropConstraintSql = N'ALTER TABLE dbo.TaiKhoan DROP CONSTRAINT ' + QUOTENAME(@constraintName);
          EXEC sp_executesql @dropConstraintSql;
        END

        ALTER TABLE dbo.TaiKhoan ALTER COLUMN TenDangNhap NVARCHAR(35) NOT NULL;

        IF NOT EXISTS (
          SELECT 1
          FROM sys.key_constraints
          WHERE parent_object_id = OBJECT_ID(N'dbo.TaiKhoan')
            AND name = N'UQ_TaiKhoan_TenDangNhap'
        )
          ALTER TABLE dbo.TaiKhoan ADD CONSTRAINT UQ_TaiKhoan_TenDangNhap UNIQUE (TenDangNhap);
      END
    `);
  }

  private async repairCorruptedTeacherUsernames() {
    await this.taiKhoanRepo.query(`
      UPDATE tk
      SET tk.TenDangNhap = gv.HoTen,
          tk.NgayCapNhat = GETDATE()
      FROM TaiKhoan tk
      JOIN GiaoVien gv ON gv.TaiKhoanID = tk.TaiKhoanID
      WHERE tk.VaiTro = 'GiaoVien'
        AND tk.TenDangNhap LIKE '%?%'
        AND gv.HoTen NOT LIKE '%?%'
        AND NOT EXISTS (
          SELECT 1
          FROM TaiKhoan existed
          WHERE existed.TaiKhoanID <> tk.TaiKhoanID
            AND existed.TenDangNhap = gv.HoTen
        )
    `);
  }

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

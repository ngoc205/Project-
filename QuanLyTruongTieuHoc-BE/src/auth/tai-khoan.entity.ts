import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('TaiKhoan') // Đồng bộ viết hoa chuẩn theo bảng SQL Server
export class TaiKhoan {
  @PrimaryGeneratedColumn({ name: 'TaiKhoanID' })
  TaiKhoanID: number;

  @Column({ name: 'TenDangNhap', type: 'varchar', length: 35, unique: true })
  TenDangNhap: string;

  @Column({ name: 'MatKhau', type: 'varchar', length: 255 })
  MatKhau: string;

  @Column({ name: 'VaiTro', type: 'varchar', length: 20 })
  VaiTro: string;

  @Column({ name: 'IsActive', type: 'bit', default: 1 })
  IsActive: boolean;

  @CreateDateColumn({ name: 'NgayTao', type: 'datetime' })
  NgayTao: Date;

  @UpdateDateColumn({ name: 'NgayCapNhat', type: 'datetime' })
  NgayCapNhat: Date;
}
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('taikhoan')
export class TaiKhoan {
  @PrimaryGeneratedColumn({ name: 'TaiKhoanID' })
  TaiKhoanID: number;

  @Column({ name: 'TenDangNhap', type: 'varchar', length: 32, unique: true })
  TenDangNhap: string;

  @Column({ name: 'MatKhau', type: 'varchar', length: 255 })
  MatKhau: string;

  @Column({ name: 'VaiTro', type: 'varchar', length: 20 })
  VaiTro: string;

  @Column({ name: 'IsActive', type: 'bit', default: 1 })
  IsActive: boolean;

  @CreateDateColumn({ name: 'NgayTao' })
  NgayTao: Date;

  @UpdateDateColumn({ name: 'NgayCapNhat' })
  NgayCapNhat: Date;
}
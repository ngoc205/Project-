import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('MonHoc') // Đồng bộ viết hoa chuẩn theo bảng SQL Server
export class MonHoc {
  @PrimaryGeneratedColumn({ name: 'MonHocID' })
  MonHocID: number;

  @Column({ name: 'TenMonHoc', type: 'nvarchar', length: 100 })
  TenMonHoc: string;

  @Column({ name: 'SoTiet', type: 'tinyint' }) // Bỏ nullable vì SQL Server là NOT NULL
  SoTiet: number;

  @Column({ name: 'MoTa', type: 'nvarchar', length: 200, nullable: true }) // Khớp độ dài 200 ký tự
  MoTa: string;

  @Column({ name: 'IsActive', type: 'bit', default: 1 })
  IsActive: boolean;

  @CreateDateColumn({ name: 'NgayTao', type: 'datetime' })
  NgayTao: Date;

  @UpdateDateColumn({ name: 'NgayCapNhat', type: 'datetime' })
  NgayCapNhat: Date;
}

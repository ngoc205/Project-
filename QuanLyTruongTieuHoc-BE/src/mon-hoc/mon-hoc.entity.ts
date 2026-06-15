import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('monhoc')
export class MonHoc {
  @PrimaryGeneratedColumn({ name: 'MonHocID' })
  MonHocID: number;

  @Column({ name: 'TenMonHoc', type: 'nvarchar', length: 100 })
  TenMonHoc: string;

  @Column({ name: 'SoTiet', type: 'tinyint', nullable: true })
  SoTiet: number;

  @Column({ name: 'MoTa', type: 'nvarchar', length: 300, nullable: true })
  MoTa: string;

  @Column({ name: 'IsActive', type: 'bit', default: 1 })
  IsActive: boolean;

  @CreateDateColumn({ name: 'NgayTao' })
  NgayTao: Date;

  @UpdateDateColumn({ name: 'NgayCapNhat' })
  NgayCapNhat: Date;
}
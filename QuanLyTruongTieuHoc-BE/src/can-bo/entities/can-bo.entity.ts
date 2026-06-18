import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('CanBo')
export class CanBo {
  @PrimaryGeneratedColumn({ name: 'CanBoID' })
  CanBoID: number;

  @Column({
    name: 'TaiKhoanID',
    nullable: true,
  })
  TaiKhoanID: number;

  @Column({
    name: 'HoTen',
    type: 'nvarchar',
    length: 100,
  })
  HoTen: string;

  @Column({
    name: 'NgaySinh',
    type: 'date',
    nullable: true,
  })
  NgaySinh: Date;

  @Column({
    name: 'SoDienThoai',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  SoDienThoai: string;

  @Column({
    name: 'ChucVu',
    type: 'nvarchar',
    length: 100,
    nullable: true,
  })
  ChucVu: string;

  @Column({
    name: 'IsActive',
    type: 'bit',
    default: true,
  })
  IsActive: boolean;

  @CreateDateColumn({
    name: 'NgayTao',
    type: 'datetime',
  })
  NgayTao: Date;

  @UpdateDateColumn({
    name: 'NgayCapNhat',
    type: 'datetime',
  })
  NgayCapNhat: Date;
}
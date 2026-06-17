import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('HocSinh')
export class HocSinh {
  @PrimaryGeneratedColumn({ name: 'HocSinhID' })
  HocSinhID: number;

  @Column({
    name: 'TenHocSinh',
    type: 'nvarchar',
    length: 100,
  })
  TenHocSinh: string;

  @Column({
    name: 'NgaySinh',
    type: 'date',
  })
  NgaySinh: Date;

  @Column({
    name: 'GioiTinh',
    type: 'nvarchar',
    length: 10,
  })
  GioiTinh: string;

  @Column({
    name: 'DiaChi',
    type: 'nvarchar',
    length: 200,
    nullable: true,
  })
  DiaChi: string;

  @Column({
    name: 'AnhDaiDien',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  AnhDaiDien: string;

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
}
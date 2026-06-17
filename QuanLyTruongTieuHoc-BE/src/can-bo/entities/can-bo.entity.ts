import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('CanBo')
export class CanBo {
  @PrimaryGeneratedColumn()
  MaCanBo: number;

  @Column()
  HoTen: string;

  @Column({ type: 'date', nullable: true })
  NgaySinh: Date;

  @Column({ nullable: true })
  GioiTinh: string;

  @Column({ nullable: true })
  SoDienThoai: string;

  @Column({ nullable: true })
  Email: string;

  @Column({ nullable: true })
  ChucVu: string;
}

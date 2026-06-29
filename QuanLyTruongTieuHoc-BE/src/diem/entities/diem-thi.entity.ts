import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('DiemThi')
export class DiemThi {
  @PrimaryGeneratedColumn()
  DiemThiID: number;

  @Column()
  HocSinhID: number;

  @Column()
  ThoiGianID: number;

  @Column()
  MonHocID: number;

  @Column({ type: 'float', nullable: true })
  DiemMieng: number; // Tương ứng với Điểm Hệ số 1 trong tài liệu

  @Column({ type: 'float', nullable: true })
  DiemGiuaKy: number; // Tương ứng với Điểm Hệ số 2

  @Column({ type: 'float', nullable: true })
  DiemCuoiKy: number; // Tương ứng với Điểm Hệ số 3
}